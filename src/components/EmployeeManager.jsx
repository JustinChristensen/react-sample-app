import { Fragment } from 'react';
import EmployeeTable from './EmployeeTable.jsx';
import { Named, WithUid } from '../hocs';
import { suffixWith } from '../utils/string.js';

export const EntryForm = WithUid(Named('EntryForm')(({ $uid }) => {
    const [fnameId, lnameId, emailId, departmentId] = suffixWith(`-${$uid}`, [
        'first-name',
        'last-name',
        'email',
        'department'
    ]);

    return (
        <form className="row mb-4">
            <div className="col">
                <label htmlFor={fnameId} className="visually-hidden">First Name</label>
                <input name="firstName" placeholder="John" type="text" id={fnameId} className="form-control" required />
            </div>

            <div className="col">
                <label htmlFor={lnameId} className="visually-hidden">Last Name</label>
                <input name="lastName" placeholder="Doe" type="text" id={lnameId} className="form-control" required />
            </div>

            <div className="col">
                <label htmlFor={emailId} className="visually-hidden">Email</label>
                <input name="email" placeholder="john.doe@foo.com" type="email" id={emailId} className="form-control" />
            </div>

            <div className="col">
                <label htmlFor={departmentId} className="visually-hidden">Department</label>
                <select name="department" id={departmentId} className="form-control" required>
                    <option value="">Select Department</option>
                    <option value="it">Information Technology</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hr">Human Resources</option>
                    <option value="bisdev">Business Development</option>
                </select>
            </div>

            <div className="col d-flex justify-content-center">
                <button type="submit" className="btn btn-primary"><small>Add Employee</small></button>
            </div>
        </form>
    );
}));

export const EmployeeManager = () => (
    <Fragment>
        <EntryForm />
        <EmployeeTable />
    </Fragment>
);

export default EmployeeManager;
