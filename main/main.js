const database = require("../main/datbase.js")
module.exports = function printInventory(inputs) {
    let orderForm = '***<没钱赚商店>购物清单***\n';
    let totalCount = 0;
    let giftItem ='挥泪赠送商品：\n';
    let saveCount = 0;

    //将inputs的种类和数量转换成数组
   let barcodeAndValue = inputs.map((item) => {
       if(item === '') return;
       let numAndValue = item.split("-");
       if(numAndValue[1] !== undefined){
           return {key:numAndValue[0],value:Math.floor(numAndValue[1])}
       }
       return {key: numAndValue[0],value:1}
   })

    //将每种barcode的数量统计出来
     let allBuy = [];
     for(let i = 0;i < barcodeAndValue.length - 1; i++){
        if(barcodeAndValue[i].key === barcodeAndValue[i + 1].key){
            barcodeAndValue[i + 1].value += barcodeAndValue[i].value;
        }
        else allBuy.push({key:barcodeAndValue[i].key,value:barcodeAndValue[i].value})
     }
     allBuy.push({key:barcodeAndValue[barcodeAndValue.length - 1].key,value:barcodeAndValue[barcodeAndValue.length - 1].value})

    //计算优惠和挥泪赠送商品
     const allItem = database.loadAllItems();
     const promotions = database.loadPromotions()
     for(let i = 0 ;i < allBuy.length;i++){
         let allitemInfo = allItem.filter((item) => item.barcode === allBuy[i].key)
         let itemInfo = allitemInfo[0];
         let itemPrice = itemInfo.price * allBuy[i].value;
         if(allBuy[i].value >= 3){
             let saveBarcode = promotions[0].barcodes.filter((item) => item === allBuy[i].key)
             if(saveBarcode[0] !== undefined){
                 itemPrice -= itemInfo.price;
                 saveCount += itemInfo.price;
                 giftItem += `名称：${itemInfo.name}，数量：1${itemInfo.unit}\n`
             }
         }
         orderForm += `名称：${itemInfo.name}，数量：${allBuy[i].value}${itemInfo.unit}，单价：${toDecimal2(itemInfo.price)}(元)，小计：${toDecimal2(itemPrice)}(元)\n`
         totalCount += itemPrice;
     }

     //将优惠合在订单里
     orderForm += '----------------------\n';
     if(saveCount !== 0){
         orderForm += giftItem;
         orderForm += '----------------------\n'
     }
     orderForm += `总计：${toDecimal2(totalCount)}(元)\n` +
         `节省：${toDecimal2(saveCount)}(元)\n` +
         '**********************';
     console.log(orderForm);
     return orderForm;
};

//强制保留两位小数
function toDecimal2(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x*100)/100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}