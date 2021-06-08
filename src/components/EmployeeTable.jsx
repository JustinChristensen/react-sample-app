import { Fragment } from 'react';

const EmployeeTable = () => (
    <Fragment>
        <div className="row">
            <p className="col lead">Employees</p>
        </div>

        <div className="row mb-4">
            <div className="col">
                <table className="table table-hover table-borderless">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>04234134</td>
                            <td>John</td>
                            <td>Doe</td>
                            <td>john.doe@corp.com</td>
                            <td>Maintenance</td>
                            <td>
                                <button className="btn btn-link">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </Fragment>
);

export default EmployeeTable;