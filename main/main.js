'use strict';
//const fixtures = require('../test/fixtures');
const allItems = loadAllItems();
const promotion = loadPromotions();

const isBarcodeValid = (barcodes) => {
    let itemBarcodes = [];
    for(let i = 0; i < allItems.length; i++) {
        itemBarcodes.push(allItems[i].barcode);
    }
    let validBarcodeCount = 0;
    for(let i = 0; i < barcodes.length; i++) {
        if(itemBarcodes.indexOf(barcodes[i].split('-')[0]) > -1) {
            validBarcodeCount++;
        }
    }
    if(validBarcodeCount == barcodes.length){
        return true;
    }
    return false;
};

const getBarcodeCount = (barcodes) => {
    let barcodeCount = {};
    for(let i = 0; i < barcodes.length; i++) {
        let eachBarcode = barcodes[i]; 
        let eachBarcodePrefix = eachBarcode.split("-")[0];
        let eachBarcodeSuffix = eachBarcode.split("-")[1];
        if(eachBarcodeSuffix) {
            barcodeCount[eachBarcodePrefix] = (barcodeCount[eachBarcodePrefix] +
                parseFloat(eachBarcodeSuffix) ) || parseFloat(eachBarcodeSuffix);
        }else {
            barcodeCount[eachBarcodePrefix] = (barcodeCount[eachBarcodePrefix] +1 ) || 1; 
        }
    }
    return barcodeCount;
};

const getBarcodeDistinct = (barcodeCount) => {
    let barcodeDistinct = [];
    for(let barcode in barcodeCount) {
        barcodeDistinct.push(barcode);
    }
    return barcodeDistinct;
};

const getItemCart = (barcodeDistinct) => {
    let itemCart = [];
    for(let i = 0; i < barcodeDistinct.length; i++){
        for(let j = 0; j < allItems.length; j++) {
            if(barcodeDistinct[i] === allItems[j]['barcode']) {
                //delete allItems[i]['barcode'];
                itemCart.push(allItems[j]);
                break;
            }
        }

    }
    return itemCart;
};

const getItemCartPromotion = (barcodeCount, itemCart) => {
    let itemCartEachPromotion = {};
    let itemCartPromotion = {};
    let totalPromotion = 0;
    for(let i = 0; i < itemCart.length; i++) {
        let barcode = itemCart[i]['barcode'];
        let price = itemCart[i]['price'];
        itemCartEachPromotion[barcode] = 0;
        for(let j = 0; j < promotion[0]['barcodes'].length; j++){
            if(barcode == promotion[0]['barcodes'][j] && barcodeCount[barcode] >= 2){
                itemCartEachPromotion[barcode] = price;
                totalPromotion += price;
                break; 
            }
        }
    }
    itemCartPromotion['total'] = totalPromotion;
    itemCartPromotion['each'] = itemCartEachPromotion;
    return itemCartPromotion;
};

const createReceipt = (barcodeCount, itemCart, itemCartPromotion) => {
    let receipt = "***<没钱赚商店>收据***\n";
    let totalAmount = 0;
    for(let i = 0; i < itemCart.length; i++) {
        let count = barcodeCount[itemCart[i]['barcode']];
        let price = itemCart[i]['price']
        let spend = (count * parseFloat(price) - itemCartPromotion['each'][itemCart[i]['barcode']]).toFixed(2);
        receipt += `名称：${itemCart[i]['name']}，数量：${count}${itemCart[i]['unit']}，单价：${price.toFixed(2)}(元)，小计：${spend}(元)\n`;
        totalAmount += parseFloat(spend);

    }
    receipt += `----------------------\n总计：${totalAmount.toFixed(2)}(元)\n节省：${itemCartPromotion['total'].toFixed(2)}(元)\n**********************`;
    return receipt;
};

const printReceipt = (barcodes) => { 
    if(!isBarcodeValid(barcodes)) {
        console.log("[ERROR]: the barcode list has invalid barcode, please enter again!");
        return;
    }   
    let barcodeCount = getBarcodeCount(barcodes);
    let barcodeDistinct = getBarcodeDistinct(barcodeCount);
    let itemCart = getItemCart(barcodeDistinct);
    let itemCartPromotion = getItemCartPromotion(barcodeCount, itemCart);
    let receipt = createReceipt(barcodeCount, itemCart, itemCartPromotion);
    console.log(receipt);
}
