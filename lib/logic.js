/**
 * Script file for executing logic to track coffee on the supply chain.
 *//*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

  /**
   * 
   * @param {org.eyeframe.foodgenix.addFood} newFood 
   * @transaction
   */
  async function addFood(newFood) {

    const participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Warehouse');
    var NS = 'org.eyeframe.foodgenix';
    var food = getFactory().newResource(NS, 'Food', Math.random().toString(36).substring(3));
    food.batchId = newFood.batchId;
    food.type = newFood.type;
    food.quality = newFood.quality;
    food.owner = newFood.warehouse;
    food.batchState = newFood.batchState;
    

    const assetRegistry = await getAssetRegistry('org.eyeframe.foodgenix.Food');
    await assetRegistry.add(food);
    await participantRegistry.update(newFood.warehouse);
  }

  /**
   * 
   * 
   * @param {org.eyeframe.foodgenix.addFoodProduct} newFood
   * @transaction
   */
  async function addFoodProduct(newFood) {
    var NS = 'org.eyeframe.foodgenix';
          return getAssetRegistry('org.eyeframe.foodgenix.FoodProduct')
            .then(function (FoodProductAssetRegistry){
              var factory = getFactory();
              var newfoodProduct = factory.newResource(NS, 'FoodProduct', Math.random().toString(36).substring(3));
              newfoodProduct.foodProductType = newFood.foodProductType;
              newfoodProduct.productId = newFood.productId;
              newfoodProduct.productCondition = newFood.productCondition;
              newfoodProduct.productquantity = newFood.productquantity;
              newfoodProduct.batchId = newFood.batchId;

              return FoodProductAssetRegistry.add(newfoodProduct);
            })
      .catch(function (error){
        console.log(error);
      });
    }

  /**
   * 
   * @param {org.eyeframe.foodgenix.submitStorageDetails} foodBatch
   * @transaction
   */
async function submitStorageDetails(foodBatch){
  const assetRegistry = await getAssetRegistry('org.eyeframe.foodgenix.Food');
  const exists = await assetRegistry.exists(foodBatch.batchId);

  if (exists){
    const food = await assetRegistry.get(foodBatch.batchId);

    food.owner = foodBatch.warehouse;
    food.arrival = foodBatch.arrival;
    food.warehouseName = foodBatch.warehouseName;
    food.querryType = foodBatch.querryType;
    food.departure = foodBatch.departure;
    food.storageCondition = foodBatch.storageCondition;
    food.totalOutboundweight = foodBatch.totalOutboundweight;


    //event

    var event = getFactory().newEvent('org.eyeframe.foodgenix', 'getStorageDetails');
    event.batchId = foodBatch.batchId;
    event.warehouse = foodBatch.warehouse;
    event.querryType = foodBatch.querryType;
    event.departure = foodBatch.departure;
    event.storageCondition = foodBatch.storageCondition;
    event.totalOutboundweight = foodBatch.totalOutboundweight;

    emit(event);

    var participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Warehouse');
    await participantRegistry.update(foodBatch.warehouse);

    await assetRegistry.update(food);
  } else {
    throw new Error("Enter a valid batch ID");
  }
}

  /**
   * 
   * @param {org.eyeframe.foodgenix.submitLogisticsDetails} foodBatch
   * @transaction
   */
async function submitLogisticsDetails(foodBatch){
  const assetRegistry = await getAssetRegistry('org.eyeframe.foodgenix.Food');

  const exists = await assetRegistry.exists(foodBatch.batchId);

  if (exists) {
    const food = await assetRegistry.get(foodBatch.batchId);

    food.owner = foodBatch.logisticParty;

    food.outForShipping = foodBatch.outForShipping;
    food.LogisticsCompanyName = foodBatch.LogisticsCompanyName;
    food.LogisticsContainerNo = foodBatch.LogisticsContainerNo;
    food.ShipmentDeliveryDate = foodBatch.ShipmentDeliveryDate;
    food.ReasonForShipmentDelay = foodBatch.ReasonForShipmentDelay;

    //event
    var event = getFactory().newEvent('org.eyeframe.foodgenix', 'getLogisticsDetails');
    event.batchId = foodBatch.batchId;
    event.warehouse = foodBatch.warehouse;
    event.logisticParty = foodBatch.logisticParty;
    event.outForShipping = foodBatch.outForShipping;
    event.LogisticsCompanyName = foodBatch.LogisticsCompanyName;
    event.LogisticsContainerNo = foodBatch.LogisticsContainerNo;
    event.ShipmentDeliveryDate = foodBatch.ShipmentDeliveryDate;
    event.ReasonForShipmentDelay = foodBatch.ReasonForShipmentDelay;
    emit(event);

    var participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.LogisticParty')
    await participantRegistry.update(foodBatch.logisticParty);

    food.owner = foodBatch.logisticParty;
    participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.LogisticParty');
    await participantRegistry.update(foodBatch.logisticParty);

    await assetRegistry.update(food);
  } else {
      throw new Error('The batch you entered is invalid');
  }
}

  /**
   * 
   * @param {org.eyeframe.foodgenix.submitInboundWeightTally} foodBatch
   * @transaction
   */
  async function submitInboundWeightTally(foodBatch){
    const assetRegistry = await getAssetRegistry('org.eyeframe.foodgenix.Food');

    const exists = await assetRegistry.exists(foodBatch.batchId);

    if (exists){
      const food = await assetRegistry.get(foodBatch.batchId);
      food.owner = foodBatch.retailer;
      food.dateStripped = foodBatch.dateStripped;
      food.marks = foodBatch.marks;
      food.bagsExpected = foodBatch.bagsExpected;
      food.condition = foodBatch.condition;

      //event 
      var event = getFactory().newEvent('org.eyeframe.foodgenix', 'getInboundWeightTally');
      event.logisticParty = foodBatch.logisticParty;
      event.retailer = foodBatch.retailer;
      event.batchId = foodBatch.batchId;
      event.dateStripped = foodBatch.dateStripped;
      event.marks = foodBatch.marks;
      event.bagsExpected = foodBatch.bagsExpected;
      event.condition = foodBatch.condition;
      emit(event);

      var participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Retailer');
      await participantRegistry.update(foodBatch.retailer);
  
      food.owner = foodBatch.retailer;
      participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Retailer');
      await participantRegistry.update(foodBatch.retailer);
  
      await assetRegistry.update(food);      
    } else {
        throw new Error('The batch you entered is invalid');
    }
  }

  /**
   * 
   * @param {org.eyeframe.foodgenix.submitSaleInfo} foodBatch
   * @transaction
   */
  async function submitSaleInfo(foodBatch) {
    const assetRegistry = await getAssetRegistry('org.eyeframe.foodgenix.FoodProduct');

    const exists = await assetRegistry.exists(foodBatch.productId);

    if (exists){
      const foodProduct = await assetRegistry.get(foodBatch.productId);

      foodProduct.owner = foodBatch.customer;
      foodProduct.saleDate = foodBatch.saleDate;
      foodProduct.customerName = foodBatch.customerName;
      foodProduct.productCondition = foodBatch.productCondition;
      foodProduct.productquantity = foodBatch.productquantity;

      //event
      var event = getFactory().newEvent('org.eyeframe.foodgenix', 'getSaleInfo');
      event.retailer = foodBatch.retailer;
      event.customer = foodBatch.customer;
      event.saleDate = foodBatch.saleDate;
      event.customerName = foodBatch.customerName;
      event.productCondition = foodBatch.productCondition;
      event.productquantity = foodBatch.productquantity;
      event.batchId = foodBatch.batchId;
      event.productId = foodBatch.productId;
      emit(event);

      var participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Customer');
      await participantRegistry.update(foodBatch.customer);
  
      foodProduct.owner = foodBatch.customer;
      participantRegistry = await getParticipantRegistry('org.eyeframe.foodgenix.Customer');
      await participantRegistry.update(foodBatch.customer);
  
      await assetRegistry.update(foodProduct); 
    } else {
      throw new Error('The batch you entered is invalid');
  }
  }