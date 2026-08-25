const API_URL =
    'https://script.google.com/macros/s/AKfycbyEzjSbd9Sg1fvHT9tmFTzw57ejkm-KT7O_lCabzxxWrBUB9P0pdUtJEweFRJsklJQX/exec';


let masterData = {

    ingredients: [],
    recipes: [],
    recipeIngredients: [],
    packaging: [],
    expenses: []

};


document.addEventListener('DOMContentLoaded', function () {

    loadMasterlist();

    setupEvents();

});


function loadMasterlist() {

    document.getElementById('loading').style.display = 'block';

    document.getElementById('calculator').style.display = 'none';


    const callbackName =
        'googleSheetCallback_' + Date.now();


    window[callbackName] = function (data) {

        try {

            if (!data.success) {

                throw new Error(
                    'Google Sheet API returned an error.'
                );

            }


            masterData = data;


            populateRecipes();

            populatePackaging();


            document.getElementById('loading')
                .style.display = 'none';

            document.getElementById('calculator')
                .style.display = 'block';


        } catch (error) {

            showError(error.message);

        }


        delete window[callbackName];

        script.remove();

    };


    const script =
        document.createElement('script');


    script.src =
        API_URL +
        '?callback=' +
        callbackName +
        '&t=' +
        Date.now();


    script.onerror = function () {

        showError(
            'Unable to connect to Google Sheets.'
        );

    };


    document.body.appendChild(script);

}


function setupEvents() {

    document.getElementById('recipeSelect')
        .addEventListener(
            'change',
            calculateRecipe
        );


    document.getElementById('packagingSelect')
        .addEventListener(
            'change',
            calculateTotal
        );


    document.getElementById('packagingQty')
        .addEventListener(
            'input',
            calculateTotal
        );


    document.getElementById('labor')
        .addEventListener(
            'input',
            calculateTotal
        );


    document.getElementById('utilities')
        .addEventListener(
            'input',
            calculateTotal
        );


    document.getElementById('misc')
        .addEventListener(
            'input',
            calculateTotal
        );


    document.getElementById('pricingMethod')
        .addEventListener(
            'change',
            calculateTotal
        );


    document.getElementById('profitPercent')
        .addEventListener(
            'input',
            calculateTotal
        );


    document.getElementById('refreshButton')
        .addEventListener(
            'click',
            loadMasterlist
        );

}


function populateRecipes() {

    const select =
        document.getElementById('recipeSelect');


    select.innerHTML =
        '<option value="">Select recipe</option>';


    masterData.recipes.forEach(function (recipe) {

        const option =
            document.createElement('option');


        option.value =
            recipe.recipe_id;


        option.textContent =
            recipe.recipe_name;


        select.appendChild(option);

    });

}


function populatePackaging() {

    const select =
        document.getElementById('packagingSelect');


    select.innerHTML =
        '<option value="">No packaging</option>';


    masterData.packaging.forEach(function (item) {

        const option =
            document.createElement('option');


        option.value =
            item.packaging_id;


        option.textContent =
            item.packaging_name +
            ' - ' +
            money(item.cost);


        select.appendChild(option);

    });

}


function calculateRecipe() {

    const recipeId =
        document.getElementById('recipeSelect').value;


    if (!recipeId) {

        document.getElementById('yieldQty').value = '';

        document.getElementById('yieldUnit').value = '';

        document.getElementById('ingredientList').innerHTML =
            '<p class="muted">Select a recipe first.</p>';

        calculateTotal();

        return;

    }


    const recipe =
        masterData.recipes.find(
            function (item) {

                return String(item.recipe_id) ===
                    String(recipeId);

            }
        );


    if (!recipe) {
        return;
    }


    document.getElementById('yieldQty').value =
        recipe.yield_qty;


    document.getElementById('yieldUnit').value =
        recipe.yield_unit;


    const recipeItems =
        masterData.recipeIngredients.filter(
            function (item) {

                return String(item.recipe_id) ===
                    String(recipeId);

            }
        );


    let html = '';


    recipeItems.forEach(function (item) {

        const ingredient =
            masterData.ingredients.find(
                function (ingredient) {

                    return String(
                        ingredient.ingredient_id
                    ) === String(
                        item.ingredient_id
                    );

                }
            );


        if (!ingredient) {
            return;
        }


        const quantity =
            Number(item.quantity) || 0;


        const costPerUnit =
            Number(ingredient.cost_per_unit) || 0;


        const cost =
            quantity * costPerUnit;


        html += `

            <div class="ingredient-row">

                <div>

                    <div class="ingredient-name">
                        ${ingredient.ingredient_name}
                    </div>

                    <div class="ingredient-details">

                        ${quantity}
                        ${item.unit}

                        ×

                        ${money(costPerUnit)}
                    </div>

                </div>

                <div class="ingredient-cost">

                    ${money(cost)}

                </div>

            </div>

        `;

    });


    document.getElementById('ingredientList')
        .innerHTML = html || 
        '<p class="muted">No ingredients found.</p>';


    calculateTotal();

}


function calculateIngredientTotal() {

    const recipeId =
        document.getElementById('recipeSelect').value;


    if (!recipeId) {
        return 0;
    }


    const recipeItems =
        masterData.recipeIngredients.filter(
            function (item) {

                return String(item.recipe_id) ===
                    String(recipeId);

            }
        );


    let total = 0;


    recipeItems.forEach(function (item) {

        const ingredient =
            masterData.ingredients.find(
                function (ingredient) {

                    return String(
                        ingredient.ingredient_id
                    ) === String(
                        item.ingredient_id
                    );

                }
            );


        if (!ingredient) {
            return;
        }


        const quantity =
            Number(item.quantity) || 0;


        const costPerUnit =
            Number(ingredient.cost_per_unit) || 0;


        total +=
            quantity * costPerUnit;

    });


    return total;

}


function calculatePackaging() {

    const packagingId =
        document.getElementById(
            'packagingSelect'
        ).value;


    const quantity =
        Number(
            document.getElementById(
                'packagingQty'
            ).value
        ) || 0;


    if (!packagingId) {
        return 0;
    }


    const packaging =
        masterData.packaging.find(
            function (item) {

                return String(
                    item.packaging_id
                ) === String(packagingId);

            }
        );


    if (!packaging) {
        return 0;
    }


    return (
        Number(packaging.cost) || 0
    ) * quantity;

}


function calculateTotal() {

    const ingredientTotal =
        calculateIngredientTotal();


    const packagingTotal =
        calculatePackaging();


    const labor =
        Number(
            document.getElementById('labor').value
        ) || 0;


    const utilities =
        Number(
            document.getElementById('utilities').value
        ) || 0;


    const misc =
        Number(
            document.getElementById('misc').value
        ) || 0;


    const batchCost =
        ingredientTotal +
        packagingTotal +
        labor +
        utilities +
        misc;


    const yieldQty =
        Number(
            document.getElementById('yieldQty').value
        ) || 0;


    const costPerUnit =
        yieldQty > 0
            ? batchCost / yieldQty
            : 0;


    const method =
        document.getElementById(
            'pricingMethod'
        ).value;


    const percentage =
        Number(
            document.getElementById(
                'profitPercent'
            ).value
        ) || 0;


    let sellingPrice = 0;


    if (method === 'markup') {

        sellingPrice =
            costPerUnit *
            (1 + percentage / 100);

    } else {

        if (percentage >= 100) {

            sellingPrice = 0;

        } else {

            sellingPrice =
                costPerUnit /
                (1 - percentage / 100);

        }

    }


    const profitPerUnit =
        sellingPrice - costPerUnit;


    const batchProfit =
        profitPerUnit * yieldQty;


    document.getElementById('ingredientTotal')
        .textContent =
        money(ingredientTotal);


    document.getElementById('batchCost')
        .textContent =
        money(batchCost);


    document.getElementById('costPerUnit')
        .textContent =
        money(costPerUnit);


    document.getElementById('sellingPrice')
        .textContent =
        money(sellingPrice);


    document.getElementById('profitPerUnit')
        .textContent =
        money(profitPerUnit);


    document.getElementById('batchProfit')
        .textContent =
        money(batchProfit);

}


function money(value) {

    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );

}


function showError(message) {

    document.getElementById('loading').innerHTML = `

        <div class="error">

            <strong>Error</strong>

            <br><br>

            ${message}

        </div>

    `;

}
