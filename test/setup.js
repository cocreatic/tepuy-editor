import { default as chai } from 'chai';
import { default as chaiAsPromised } from 'chai-as-promised';

chai.should();
chai.use(chaiAsPromised);

const expect = chai.expect;

export { 
    expect
};
