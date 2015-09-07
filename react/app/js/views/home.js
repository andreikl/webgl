import React from 'react';

export default React.createClass({
    displayName: 'homePage',
    render () {
        return <ul>
            <li>
                <a href='#/tutorials/tutorial1'>Tutorial 1</a>
            </li>
            <li>
                <a href='#/tutorials/tutorial2'>Tutorial 2</a>
            </li>
            <li>
                <a href='#/tutorials/tutorial3'>Tutorial 3</a>
            </li>
            <li>
                <a href='#/tutorials/tutorial4'>Tutorial 4</a>
            </li>
        </ul>
    }
});
