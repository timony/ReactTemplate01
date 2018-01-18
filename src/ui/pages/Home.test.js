import React from 'react';
import renderer from 'react-test-renderer';
import {Home} from './Home';

describe('Home dump component', () => {

  it('should render with defaults', () => {
    const component = renderer.create(<Home/>);
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});