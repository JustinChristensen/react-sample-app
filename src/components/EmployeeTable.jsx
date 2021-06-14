const EmployeeTable = () => (
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
                        <td><input type="text" className="form-control-plaintext px-1" value="03423434" readOnly /></td>
                        <td><input type="text" className="form-control-plaintext px-1" value="John" readOnly /></td>
                        <td><input type="text" className="form-control-plaintext px-1" value="Doe" readOnly /></td>
                        <td><input type="email" className="form-control-plaintext px-1" value="john.doe@corp.com" readOnly /></td>
                        <td>
                            <select className="form-control-plaintext" value="hr" readOnly>
                                <option value="it">Information Technology</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="hr">Human Resources</option>
                                <option value="bisdev">Business Development</option>
                            </select>
                        </td>
                        <td>
                            <button className="btn btn-link p-0 mt-1">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

export default EmployeeTable;
