import { Tepuy } from '../src/js/tepuy';
import { expect } from 'chai';

import { default as tepuys } from './tepuy.spec.json';

describe('Tepuy parser', function () {
    let tepuy;

    before(function() {
        console.log('Running before');
        return new Promise((resolve, reject) => {
            tepuy = new Tepuy(tepuys[0]);
            resolve();
        })
    })

    it('should have a parse method', function() {
        expect(tepuy.parse).not.be.undefined;
    })

    it('should be able to run the parse method', function() {
        return tepuy.parse().then(result => {
            expect(result).be.equal({});
        }, err => {
            console.log(err);
        });
    })
})