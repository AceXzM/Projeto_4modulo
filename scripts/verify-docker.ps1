#requires -Version 5.1
# 052
# Verifica os servicos, os cadastros e a persistencia no Docker usando dados temporarios de teste
param([switch]$SkipRebuild)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$reportPath = Join-Path $root 'docs/evidence/docker-validation.json'
$report = [ordered]@{
    checkedAt=(Get-Date).ToUniversalTime().ToString('o')
    status='running'
    checks=@()
    note='Somente dados sintéticos de teste; nenhum segredo é registrado.'
}
$userId = 0
$email = ''
$headers = @{
}
$created = @()
# 052.01
# confere o resultado da verificacao e registra a aprovacao no relatorio
function Check([string]$name, [bool]$passed) {
    if (!$passed) {
        throw "Falhou: $name"
    }
    $report.checks += [ordered]@{
        name=$name
        passed=$true
    }
    Write-Host "OK: $name"
}
# 052.02
# Executa o Docker Compose e confere se o comando terminou sem erro
function Compose {
    # no PowerShell 5.1, stderr pode conter progresso normal do Docker
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $result = & docker compose @args 2>&1
        $commandExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }
    if ($commandExitCode -ne 0) {
        throw 'Docker Compose falhou. Verifique o Engine, as permissões e os logs locais.'
    }
    return $result
}
# 052.03
# Envia uma requisicao para a API com os cabecalhos da sessao e o corpo em JSON quando informado
function Request([string]$method,[string]$path,$body=$null) {
    $params=@{
        Uri="$base/api$path"
        Method=$method
        Headers=$headers
        TimeoutSec=30
    }
    if($null -ne $body){
        $params.ContentType='application/json; charset=utf-8'
        $params.Body=[System.Text.Encoding]::UTF8.GetBytes(($body|ConvertTo-Json -Depth 5 -Compress))
    }
    Invoke-RestMethod @params
}
# 052.04
# faz a requisicao e confere se a resposta tem o status HTTP esperado
function ExpectStatus([string]$method,[string]$path,$body,[int]$expected) {
    $status=0
    try {
        Request $method $path $body | Out-Null
    } catch {
        if($_.Exception.Response){
            $status=[int]$_.Exception.Response.StatusCode
        }else{
            throw
        }
    }
    Check "$method $path retorna $expected" ($status -eq $expected)
}
# 052.05
# Gera um CPF com digitos validos para usar nos testes
function TestCpf {
    $digits=@()
    for($i=0;$i -lt 9;$i++){
        $digits+=Get-Random -Minimum 0 -Maximum 10
    }
    foreach($count in @(9,10)){
        $sum=0
        for($i=0;$i -lt $count;$i++){
            $sum+=$digits[$i]*($count+1-$i)
        }
        $digit=($sum*10)%11
        if($digit -eq 10){
            $digit=0
        }
        $digits+=$digit
    }
    return ($digits -join '')
}
Push-Location $root
try {
    Compose config --quiet | Out-Null
    Check 'Compose válido' $true
    if($SkipRebuild){
        Compose up -d --wait | Out-Null
    }else{
        Compose up --build -d --wait | Out-Null
    }
    Check 'Três serviços iniciados com saúde' $true
    $address = (Compose port frontend 80 | Select-Object -First 1).ToString().Trim()
    $port = [int]($address.Split(':')[-1])
    $base = "http://127.0.0.1:$port"
    foreach($service in @('backend','mysql')){
        $container=(Compose ps -q $service).ToString().Trim()
        $ports = & docker inspect $container --format '{{json .NetworkSettings.Ports}}' | ConvertFrom-Json
        if($LASTEXITCODE -ne 0){
            throw 'Falha ao inspecionar isolamento.'
        }
        Check "$service sem porta publicada" (@($ports.PSObject.Properties|Where-Object {
            $null -ne $_.Value
        }).Count -eq 0)
        $networks=& docker inspect $container --format '{{json .NetworkSettings.Networks}}'|ConvertFrom-Json
        foreach($network in $networks.PSObject.Properties.Name){
            $internal=& docker network inspect $network --format '{{.Internal}}'
            if($LASTEXITCODE -ne 0){
                throw 'Falha ao inspecionar rede.'
            }
            Check "Rede de $service é interna: $network" ($internal -eq 'true')
        }
    }
    Compose exec -T frontend nginx -t | Out-Null
    Check 'Nginx válido' $true
    Check 'API acessível pelo Nginx' ((Request GET '/health').status -eq 'ok')
    foreach($route in @('/login','/register','/departments/new','/tasks/1/edit')){
        $response=Invoke-WebRequest "$base$route" -TimeoutSec 15 -UseBasicParsing
        Check "Fallback SPA em $route" ($response.StatusCode -eq 200 -and $response.Content -match '<div id="root">')
    }
    ExpectStatus GET '/departments' $null 401
    ExpectStatus POST '/auth/register' @{
    } 400
    $tag=[guid]::NewGuid().ToString('N')
    $email="rubric-$tag@example.com"
    $password="TestA1-$tag"
    $cpf=TestCpf
    $user=Request POST '/auth/register' @{
        name='Verificação automática'
        email=$email
        password=$password
        cpf=$cpf
    }
    $userId=[int]$user.id
    Check 'Cadastro sem expor hash' ($userId -gt 0 -and !$user.passwordHash)
    ExpectStatus POST '/auth/register' @{
        name='Duplicado'
        email=$email
        password=$password
        cpf=$cpf
    } 409
    $session=Request POST '/auth/login' @{
        email=$email
        password=$password
    }
    $headers=@{
        Authorization="Bearer $($session.token)"
    }
    Check 'Login e perfil autenticado' ((Request GET '/auth/me').id -eq $userId)
    ExpectStatus PUT '/auth/me' @{
        name='Teste'
        cpf=$cpf
        email='changed@example.com'
    } 400
    $nextPassword="UpdatedA1-$tag"
    $updatedProfile=Request PUT '/auth/me' @{
        name='Perfil atualizado'
        cpf=$cpf
        currentPassword=$password
        password=$nextPassword
    }
    Check 'Perfil mantém e-mail e atualiza nome/senha' ($updatedProfile.email -eq $email -and $updatedProfile.name -eq 'Perfil atualizado')
    $session=Request POST '/auth/login' @{
        email=$email
        password=$nextPassword
    }
    $headers=@{
        Authorization="Bearer $($session.token)"
    }
    $department=Request POST '/departments' @{
        name="Rubrica-$tag"
        description='Registro temporário para teste de persistência'
    }
    $created+=@{
        endpoint='departments'
        id=[int]$department.id
    }
    $employee=Request POST '/employees' @{
        name='Pessoa sintética'
        email="employee-$tag@example.com"
        role='Analista'
        departmentId=$department.id
    }
    $created+=@{
        endpoint='employees'
        id=[int]$employee.id
    }
    $task=Request POST '/tasks' @{
        title='Teste de integração'
        status='PENDENTE'
        employeeId=$employee.id
    }
    $created+=@{
        endpoint='tasks'
        id=[int]$task.id
    }
    $asset=Request POST '/assets' @{
        name='Ativo de teste'
        code="TEST-$tag"
        category='Teste'
        status='DISPONIVEL'
        departmentId=$department.id
    }
    $created+=@{
        endpoint='assets'
        id=[int]$asset.id
    }
    foreach($item in $created){
        Check "Leitura do CRUD $($item.endpoint)" ((Request GET "/$($item.endpoint)/$($item.id)").id -eq $item.id)
        $list=Request GET "/$($item.endpoint)?page=1&limit=1"
        Check "Paginação do CRUD $($item.endpoint)" ($list.limit -eq 1 -and @($list.data).Count -le 1 -and $list.total -ge 1)
    }
    Request PUT "/departments/$($department.id)" @{
        name="Rubrica-$tag"
        description='Atualizado'
    } | Out-Null
    Request PUT "/employees/$($employee.id)" @{
        name='Pessoa sintética'
        email="employee-$tag@example.com"
        role='Gestor'
        departmentId=$department.id
    } | Out-Null
    Request PUT "/tasks/$($task.id)" @{
        title='Teste atualizado'
        status='CONCLUIDA'
        employeeId=$employee.id
    } | Out-Null
    Request PUT "/assets/$($asset.id)" @{
        name='Ativo atualizado'
        code="TEST-$tag"
        category='Teste'
        status='EM_USO'
        departmentId=$department.id
    } | Out-Null
    Check 'Atualização dos quatro CRUDs' $true
    ExpectStatus POST '/tasks' @{
        title='Inválido'
        status='INVALIDO'
    } 400
    # reinicia a stack preservando o volume, nunca usa down -v
    Compose down | Out-Null
    Compose up -d --wait | Out-Null
    Check 'Dados persistem após remover/recriar contêineres' ((Request GET "/departments/$($department.id)").name -eq "Rubrica-$tag")
    foreach($item in ($created | Select-Object -Last 2)) {
        Request DELETE "/$($item.endpoint)/$($item.id)" | Out-Null
    }
    Request DELETE "/employees/$($employee.id)" | Out-Null
    Request DELETE "/departments/$($department.id)" | Out-Null
    ExpectStatus PUT "/departments/$($department.id)" @{
        name='Ausente'
    } 404
    ExpectStatus DELETE "/departments/$($department.id)" $null 404
    Check 'Exclusão e prevenção de alterações em registros inexistentes' $true
    $created=@()
    $report.status='passed'
} catch {
    $report.status='failed'
    $report.error=$_.Exception.Message
    Write-Warning $report.error
} finally {
    # Limpa exclusivamente registros criados nesta execucao, sem tocar em cadastros preexistentes
    [array]::Reverse($created)
    foreach($item in $created){
        try{
            Request DELETE "/$($item.endpoint)/$($item.id)" | Out-Null
        }catch{
        }
    }
    if($userId -gt 0 -and $email -match '^rubric-[a-f0-9]+@example\.com$'){
        $cleanup='const {User}=require("./dist/models/User");const {sequelize}=require("./dist/config/database");User.destroy({where:{id:Number(process.argv[1]),email:process.argv[2]}}).then(()=>sequelize.close()).catch(()=>process.exit(1));'
        try{
            Compose exec -T backend node -e $cleanup $userId $email | Out-Null
        }catch{
        }
    }
    New-Item -ItemType Directory -Force (Split-Path $reportPath) | Out-Null
    $report | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 $reportPath
    Pop-Location
}
if($report.status -ne 'passed'){
    exit 1
}
