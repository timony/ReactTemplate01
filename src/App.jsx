import React from 'react';
import {render} from 'react-dom';
import Home from 'ui/pages/Home';

document.addEventListener('DOMContentLoaded', () => {
    render(<Home/>, document.getElementById('app'));
});

