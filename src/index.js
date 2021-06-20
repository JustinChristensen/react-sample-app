import init from './init.js';
import './main.css';
init().catch(({ initError }) => console.error(initError));
