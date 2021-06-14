import { Fragment } from 'react';
import EmployeeManager from './EmployeeManager.jsx';
import Header from './Header.jsx';

const App = () => (
    <Fragment>
        <Header />

        <div className="container">
            <EmployeeManager />
        </div>
    </Fragment>
);

export default App;
