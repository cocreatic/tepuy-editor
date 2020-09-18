export class XPath {
    constructor(xml) {
        this.xml = xml;
    }

    selectNodes(xpath) {
        const snapshot = this.xml.evaluate(xpath, this.xml, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        const result = [];
        for(let i = 0; i < snapshot.snapshotLength; i++) {
            result.push(snapshot.snapshotItem(i));
        }
        return result;
    }
    
    select(xpath) {
        const snapshot = this.xml.evaluate(xpath, this.xml, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        if (snapshot.snapshotLength) {
            return snapshot.snapshotItem(0);
        }
        return null;
    }
}