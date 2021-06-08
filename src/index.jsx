import { render } from 'react-dom';
import App from './components/App';
import './main.css';

const container = document.createElement('div');
container.classList.add('app-container');
document.body.prepend(container)
render(<App />, container);