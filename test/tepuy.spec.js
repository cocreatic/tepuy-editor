import { expect } from './setup';
import { App } from '../src/js/app';
import { Section } from '../src/js/component';
import { Tepuy } from '../src/js/tepuy';
import { default as tepuys } from './tepuy.spec.json';


describe('Tepuy parser', function () {
    let tepuy;

    before(function() {
        return new Promise((resolve, reject) => {
            App.init({
                theme: 'light', //
            }).then(r => {
                tepuy = new Tepuy(tepuys[0]);
                resolve();
            });
        });
    })

    beforeEach(function() {
        return tepuy.parse();
    })

//    it('should have a parse method', function() {
//        expect(tepuy.parse).not.be.undefined;
//    })

//    it('should be able to run the parse method', function() {
//        expect(tepuy.parse()).to.become(true);
//    })

    it('should create home root as Section', function() {
        expect(tepuy.home.root).to.be.an.instanceof(Section);
    })
})