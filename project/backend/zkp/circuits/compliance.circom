pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Agricultural Compliance ZKP Circuit
 *
 * Proves that private farmer data satisfies crop-specific rules
 * without revealing the actual values.
 *
 * Private inputs: yield, temperature, inventory, pesticide, price
 * Public inputs:  minYield, maxPesticide, minInventory,
 *                 minTemperature, maxTemperature, minPrice, maxPrice
 *
 * All values must be scaled integers (backend uses SCALE = 1000).
 */
template ComplianceCheck() {
    signal input yield;
    signal input temperature;
    signal input inventory;
    signal input pesticide;
    signal input price;

    signal input minYield;
    signal input maxPesticide;
    signal input minInventory;
    signal input minTemperature;
    signal input maxTemperature;
    signal input minPrice;
    signal input maxPrice;

    component yieldGte = GreaterEqThan(32);
    yieldGte.in[0] <== yield;
    yieldGte.in[1] <== minYield;
    yieldGte.out === 1;

    component pestLte = LessEqThan(32);
    pestLte.in[0] <== pesticide;
    pestLte.in[1] <== maxPesticide;
    pestLte.out === 1;

    component invGte = GreaterEqThan(32);
    invGte.in[0] <== inventory;
    invGte.in[1] <== minInventory;
    invGte.out === 1;

    component tempMinGte = GreaterEqThan(32);
    tempMinGte.in[0] <== temperature;
    tempMinGte.in[1] <== minTemperature;
    tempMinGte.out === 1;

    component tempMaxLte = LessEqThan(32);
    tempMaxLte.in[0] <== temperature;
    tempMaxLte.in[1] <== maxTemperature;
    tempMaxLte.out === 1;

    component priceMinGte = GreaterEqThan(32);
    priceMinGte.in[0] <== price;
    priceMinGte.in[1] <== minPrice;
    priceMinGte.out === 1;

    component priceMaxLte = LessEqThan(32);
    priceMaxLte.in[0] <== price;
    priceMaxLte.in[1] <== maxPrice;
    priceMaxLte.out === 1;
}

component main {
    public [
        minYield,
        maxPesticide,
        minInventory,
        minTemperature,
        maxTemperature,
        minPrice,
        maxPrice
    ]
} = ComplianceCheck();
