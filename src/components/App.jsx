import { EmployeeManager } from './EmployeeManager.jsx';
import { AppHeader } from './AppHeader.jsx';

const App = () => (
    <>
        <AppHeader />

        <div className="container">
            <EmployeeManager />
        </div>
    </>
);

export default App;
