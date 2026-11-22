/* 027
 * liga departamentos a colaboradores e ativos e liga colaboradores as suas tarefas
 */
import { Department } from './Department';
import { Employee } from './Employee';
import { Task } from './Task';
import { Asset } from './Asset';

Department.hasMany(Employee, {
  foreignKey: 'departmentId',
  as: 'employees',
});
Employee.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});
Employee.hasMany(Task, {
  foreignKey: 'employeeId',
  as: 'tasks',
});
Task.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'assignee',
});
Department.hasMany(Asset, {
  foreignKey: 'departmentId',
  as: 'assets',
});
Asset.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});
