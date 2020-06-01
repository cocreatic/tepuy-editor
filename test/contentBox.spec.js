import { expect } from './setup';

import { ContentBox } from '../src/plugins/cmpt.tepuyBasic/components/contentBox';
import { default as tepuys } from './tepuy.spec.json';

describe('ContentBox component', function () {
    let validElement1;
    let validElement2;
    let invalidElement1;

    before(function() {
    })

    beforeEach(function() {
        validElement1 = document.createElement('div');
        validElement1.setAttribute('data-cmpt-type', 'content-box');
        validElement2 = document.createElement('div');
        validElement2.classList.add('box-text');
        invalidElement1 = document.createElement('div');
    })

    it('should have id equal content-box', function() {
        expect(ContentBox.id).be.equal('content-box');
    })

    it('should have selector equal [data-cmpt-type="content-box"],.box-text', function() {
        expect(ContentBox.selector).be.equal('[data-cmpt-type="content-box"],.box-text');
    })

    it('should match an element with data-cmpt-type="content-box" attribute', function() {
        expect(ContentBox.matches(validElement1)).be.true;
    })

    it('should match an element with class .box-text', function() {
        expect(ContentBox.matches(validElement2)).be.true;
    })

    it('should NOT match an element missing data-cmpt-type = "content-box" NOR having class box-text', function() {
        expect(ContentBox.matches(invalidElement1)).be.false;
    })
})