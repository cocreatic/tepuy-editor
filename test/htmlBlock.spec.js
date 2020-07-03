import { expect } from './setup';
import { HtmlBlock } from '../src/plugins/cmpt.tepuyBasic/components/htmlBlock';

describe('HtmlBlock component', function () {
    let validElement1;
    let validElement2;
    const selector = '[data-cmpt-type="html-block"],:not([data-cmpt-type])'

    before(function() {
        console.log('running HtmlBlock tests');
    })

    beforeEach(function() {
        validElement1 = document.createElement('div');
        validElement1.setAttribute('data-cmpt-type', 'html-block');
        validElement2 = document.createElement('table');
    })

    it('should have id equal content-box', function() {
        expect(HtmlBlock.id).be.equal('html-block');
    })

    it('should have selector equal ' +  selector, function() {
        expect(HtmlBlock.selector).be.equal(selector);
    })

    it('should match element with attribute data-cmpt-type="html-block"', function() {
        expect(HtmlBlock.matches(validElement1)).be.true;
    })

    it('should match element with no attribute data-cmpt-type', function() {
        expect(HtmlBlock.matches(validElement2)).be.true;
    })
    it('should set attribute data-cmpt-type on element', function() {
        const block = new HtmlBlock('p');
        expect(block.host.getAttribute('data-cmpt-type')).be.equal('html-block');
    })
})