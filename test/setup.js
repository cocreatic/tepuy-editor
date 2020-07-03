import { default as chai } from 'chai';
import { default as chaiAsPromised } from 'chai-as-promised';
import { default as chaiThings } from 'chai-things';

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiThings);

const expect = chai.expect;

export { 
    expect
};
