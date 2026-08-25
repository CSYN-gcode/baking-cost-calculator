const API_URL =
    'https://script.google.com/macros/s/AKfycbz0vvhYGvOFoszUtXq3Vp_tzMMfjCTibBhO7utFe9Yj4lAz-MY9vn8C0agCOnAr-e6G/exec';

console.log('BAKING API URL:', API_URL);

let adminAuthenticated = false;

let adminPin = '';

let masterData = {
    ingredients: [],
    recipes: [],
    recipeIngredients: [],
    packaging: [],
    expenses: []
};

document.addEventListener('DOMContentLoaded', function () {

    setupEvents();

    loadMasterlist();

});

function loadAdminTables() {

    populateIngredientsAdmin();

    populatePackagingAdmin();

    populateExpensesAdmin();

}

function populateIngredientsAdmin() {

    const tbody =
        document.getElementById(
            'ingredientsAdminBody'
        );


    tbody.innerHTML = '';


    masterData.ingredients.forEach(
        function(item) {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${item.ingredient_id}
                </td>

                <td>
                    ${item.ingredient_name}
                </td>

                <td>
                    ${item.unit}
                </td>

                <td>
                    ${item.purchase_qty}
                </td>

                <td>
                    ${money(item.purchase_price)}
                </td>

                <td>
                    ${money(item.cost_per_unit)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="editIngredient('${item.ingredient_id}')"
                    >
                        ✏ Edit
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}

function populatePackagingAdmin() {

    const tbody =
        document.getElementById(
            'packagingAdminBody'
        );


    tbody.innerHTML = '';


    masterData.packaging.forEach(
        function(item) {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${item.packaging_id}
                </td>

                <td>
                    ${item.packaging_name}
                </td>

                <td>
                    ${item.unit}
                </td>

                <td>
                    ${money(item.cost)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="editPackaging('${item.packaging_id}')"
                    >
                        ✏ Edit
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}

function populateExpensesAdmin() {

    const tbody =
        document.getElementById(
            'expensesAdminBody'
        );


    tbody.innerHTML = '';


    masterData.expenses.forEach(
        function(item) {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${item.expense_id}
                </td>

                <td>
                    ${item.expense_name}
                </td>

                <td>
                    ${item.unit}
                </td>

                <td>
                    ${money(item.cost)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="editExpense('${item.expense_id}')"
                    >
                        ✏ Edit
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}

function editIngredient(id) {

    const item =
        masterData.ingredients.find(
            function(x) {

                return String(
                    x.ingredient_id
                ) === String(id);

            }
        );


    if (!item) {
        return;
    }


    const name =
        prompt(
            'Ingredient name:',
            item.ingredient_name
        );


    if (name === null) {
        return;
    }


    const quantity =
        prompt(
            'Purchase quantity (' +
            item.unit +
            '):',
            item.purchase_qty
        );


    if (quantity === null) {
        return;
    }


    const price =
        prompt(
            'Purchase price:',
            item.purchase_price
        );


    if (price === null) {
        return;
    }


    updateMasterlist(
        'Ingredients',
        {
            id: item.ingredient_id,

            ingredient_name: name,

            unit: item.unit,

            purchase_qty: quantity,

            purchase_price: price
        }
    );

}

function editPackaging(id) {

    const item =
        masterData.packaging.find(
            function(x) {

                return String(
                    x.packaging_id
                ) === String(id);

            }
        );


    if (!item) {
        return;
    }


    const name =
        prompt(
            'Packaging name:',
            item.packaging_name
        );


    if (name === null) {
        return;
    }


    const cost =
        prompt(
            'Packaging cost:',
            item.cost
        );


    if (cost === null) {
        return;
    }


    updateMasterlist(
        'Packaging',
        {
            id: item.packaging_id,

            packaging_name: name,

            unit: item.unit,

            cost: cost
        }
    );

}

function editExpense(id) {

    const item =
        masterData.expenses.find(
            function(x) {

                return String(
                    x.expense_id
                ) === String(id);

            }
        );


    if (!item) {
        return;
    }


    const name =
        prompt(
            'Expense name:',
            item.expense_name
        );


    if (name === null) {
        return;
    }


    const cost =
        prompt(
            'Cost per ' + item.unit + ':',
            item.cost
        );


    if (cost === null) {
        return;
    }


    updateMasterlist(
        'Expenses',
        {
            id: item.expense_id,

            expense_name: name,

            unit: item.unit,

            cost: cost
        }
    );

}

function updateMasterlist(
    sheet,
    data
) {

    const callbackName =
        'updateCallback_' +
        Date.now();

    window[callbackName] =
        function(response) {
            console.log(
                'UPDATE RESPONSE:',
                response
            );

            if (
                response &&
                response.success
            ) {
                alert(
                    'Saved successfully!'
                );

                /*
                 * Reload everything from
                 * Google Sheets.
                 */

                loadMasterlist();

            } else {
                alert(
                    response.error ||
                    'Unable to save changes.'
                );
            }

            delete window[callbackName];
        };

    const params = new URLSearchParams();

    params.append(
        'action',
        'update'
    );

    params.append(
        'pin',
        adminPin
    );

    params.append(
        'sheet',
        sheet
    );

    Object.keys(data)
        .forEach(function(key) {

            params.append(
                key,
                data[key]
            );

        });


    params.append(
        'callback',
        callbackName
    );


    const script =
        document.createElement('script');

    script.src =
        API_URL +
        '?' +
        params.toString();


    document.body.appendChild(
        script
    );

}

function switchAdminTab(
    tabId,
    button
) {

    document
        .querySelectorAll(
            '.admin-tab-content'
        )
        .forEach(function(tab) {

            tab.style.display =
                'none';

        });


    document
        .querySelectorAll(
            '.admin-tab'
        )
        .forEach(function(tabButton) {

            tabButton.classList
                .remove('active');

        });


    document
        .getElementById(tabId)
        .style.display =
        'block';


    button.classList.add(
        'active'
    );

}

function adminLogin() {

    const pin =
        document
            .getElementById('adminPin')
            .value
            .trim();


    if (!pin) {

        showAdminLoginError(
            'Please enter the admin PIN.'
        );

        return;

    }


    const callbackName =
        'adminLoginCallback_' +
        Date.now();


    window[callbackName] =
        function(data) {

            console.log(
                'ADMIN LOGIN:',
                data
            );


            if (
                data &&
                data.success
            ) {

                adminAuthenticated = true;

                adminPin = pin;


                document
                    .getElementById('adminLogin')
                    .style.display = 'none';


                document
                    .getElementById('adminDashboard')
                    .style.display = 'block';


                loadAdminTables();

            }

            else {

                showAdminLoginError(
                    data.error ||
                    'Invalid PIN.'
                );

            }


            delete window[callbackName];

        };


    const script =
        document.createElement('script');


    script.src =
    API_URL +
    '?action=login' +
    '&pin=' +
    encodeURIComponent(pin) +
    '&callback=' +
    callbackName;

    /*
     * We don't actually want to update anything.
     * Apps Script needs a dedicated login endpoint.
     */

    document.body.appendChild(script);

}

function loadMasterlist() {

    // showLoading();

    const callbackName =
        'bakingCalculatorCallback_' + Date.now();

    window[callbackName] = function (data) {

        console.log(
            'GOOGLE SHEETS DATA:',
            data
        );

        try {
            if (!data) {
                throw new Error(
                    'No data was returned from Google Sheets.'
                );
            }


            if (!data.success) {
                throw new Error(
                    data.error ||
                    'Google Sheets returned an error.'
                );
            }

            /*
             * Make sure the expected arrays exist.
             */

            masterData.ingredients =
                Array.isArray(data.ingredients)
                    ? data.ingredients
                    : [];


            masterData.recipes =
                Array.isArray(data.recipes)
                    ? data.recipes
                    : [];


            masterData.recipeIngredients =
                Array.isArray(data.recipeIngredients)
                    ? data.recipeIngredients
                    : [];


            masterData.packaging =
                Array.isArray(data.packaging)
                    ? data.packaging
                    : [];


            masterData.expenses =
                Array.isArray(data.expenses)
                    ? data.expenses
                    : [];


            console.log(
                'Ingredients:',
                masterData.ingredients
            );

            console.log(
                'Recipes:',
                masterData.recipes
            );

            console.log(
                'Recipe Ingredients:',
                masterData.recipeIngredients
            );

            console.log(
                'Packaging:',
                masterData.packaging
            );

            console.log(
                'Expenses:',
                masterData.expenses
            );

            populateRecipes();
            populatePackaging();
            populateExpenses();
            // hideLoading();

        } catch (error) {

            console.error(
                'MASTERLIST ERROR:',
                error
            );

            showError(
                error.message
            );
        }

        delete window[callbackName];

        const script =
            document.getElementById(
                callbackName
            );

        if (script) {
            script.remove();
        }

    };

    const script =
        document.createElement('script');

    script.id =
        callbackName;

    script.src =
        API_URL +
        '?callback=' +
        callbackName +
        '&t=' +
        Date.now();

    script.onerror = function () {
        showError(
            'Unable to connect to the Google Sheets API.'
        );
    };

    document.body.appendChild(script);
}


function setupEvents() {

    document
        .getElementById('recipeSelect')
        .addEventListener(
            'change',
            calculateRecipe
        );


    document
        .getElementById('packagingSelect')
        .addEventListener(
            'change',
            calculateTotal
        );


    document
        .getElementById('packagingQty')
        .addEventListener(
            'input',
            calculateTotal
        );

    populateExpenses();

    document
        .getElementById('pricingMethod')
        .addEventListener(
            'change',
            calculateTotal
        );


    document
        .getElementById('profitPercent')
        .addEventListener(
            'input',
            calculateTotal
        );


    document
        .getElementById('refreshButton')
        .addEventListener(
            'click',
            loadMasterlist
        );

    document
    .getElementById('adminButton')
    .addEventListener(
        'click',
        showAdmin
    );

    document
        .getElementById('calculatorButton')
        .addEventListener(
            'click',
            showCalculator
        );
    
    
    document
        .getElementById('adminLoginButton')
        .addEventListener(
            'click',
            adminLogin
        );
    
    
    document
        .getElementById('adminLogoutButton')
        .addEventListener(
            'click',
            adminLogout
        );
    
    
    document
        .querySelectorAll('.admin-tab')
        .forEach(function(button) {
    
            button.addEventListener(
                'click',
                function() {
    
                    switchAdminTab(
                        this.dataset.tab,
                        this
                    );
    
                }
            );
    
        });
}


function populateRecipes() {

    const select =
        document.getElementById(
            'recipeSelect'
        );


    select.innerHTML =
        '<option value="">Select recipe</option>';


    masterData.recipes.forEach(
        function (recipe) {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                recipe.recipe_id;


            option.textContent =
                recipe.recipe_name;


            select.appendChild(option);

        }
    );

}


function populatePackaging() {

    const select =
        document.getElementById(
            'packagingSelect'
        );


    select.innerHTML =
        '<option value="">No packaging</option>';


    masterData.packaging.forEach(
        function (item) {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                item.packaging_id;


            option.textContent =
                item.packaging_name +
                ' - ' +
                money(item.cost);


            select.appendChild(option);

        }
    );

}

function populateExpenses() {

    const container =
        document.getElementById(
            'expenseList'
        );


    container.innerHTML = '';


    if (
        !masterData.expenses ||
        masterData.expenses.length === 0
    ) {

        container.innerHTML =
            '<p class="muted">No expenses found.</p>';

        return;

    }


    masterData.expenses.forEach(
        function (expense) {

            const row =
                document.createElement('div');


            row.className =
                'expense-row';


            row.innerHTML = `

                <div class="expense-info">

                    <strong>
                        ${expense.expense_name}
                    </strong>

                    <small>
                        Rate:
                        ${money(expense.cost)}
                        /
                        ${expense.unit}
                    </small>

                </div>


                <div class="expense-input">

                    <input
                        type="number"
                        class="expense-qty"
                        data-expense-id="${expense.expense_id}"
                        value="1"
                        min="0"
                        step="0.01"
                    >

                </div>


                <div class="expense-total"
                     data-expense-total="${expense.expense_id}">

                    ${money(expense.cost)}

                </div>

            `;


            container.appendChild(row);

        }
    );


    document
        .querySelectorAll('.expense-qty')
        .forEach(function(input) {

            input.addEventListener(
                'input',
                calculateTotal
            );

        });

}

function calculateRecipe() {

    const recipeId =
        document.getElementById(
            'recipeSelect'
        ).value;


    if (!recipeId) {

        document.getElementById(
            'yieldQty'
        ).value = '';


        document.getElementById(
            'yieldUnit'
        ).value = '';


        document.getElementById(
            'ingredientList'
        ).innerHTML =
            '<p class="muted">Select a recipe first.</p>';


        calculateTotal();

        return;

    }


    const recipe =
        masterData.recipes.find(
            function (item) {

                return String(
                    item.recipe_id
                ) === String(recipeId);

            }
        );


    if (!recipe) {
        return;
    }


    document.getElementById(
        'yieldQty'
    ).value =
        recipe.yield_qty;


    document.getElementById(
        'yieldUnit'
    ).value =
        recipe.yield_unit;


    const recipeItems =
        masterData.recipeIngredients.filter(
            function (item) {

                return String(
                    item.recipe_id
                ) === String(recipeId);

            }
        );


    let html = '';


    recipeItems.forEach(
        function (item) {

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
                Number(
                    ingredient.cost_per_unit
                ) || 0;


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

        }
    );


    document.getElementById(
        'ingredientList'
    ).innerHTML =
        html ||
        '<p class="muted">No ingredients found.</p>';


    calculateTotal();

}


function calculateIngredientTotal() {

    const recipeId =
        document.getElementById(
            'recipeSelect'
        ).value;


    if (!recipeId) {
        return 0;
    }


    const recipeItems =
        masterData.recipeIngredients.filter(
            function (item) {

                return String(
                    item.recipe_id
                ) === String(recipeId);

            }
        );


    let total = 0;


    recipeItems.forEach(
        function (item) {

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
                Number(
                    ingredient.cost_per_unit
                ) || 0;


            total +=
                quantity * costPerUnit;

        }
    );


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

function calculateExpenses() {

    let total = 0;


    document
        .querySelectorAll('.expense-qty')
        .forEach(function(input) {

            const expenseId =
                input.dataset.expenseId;


            const quantity =
                Number(input.value) || 0;


            const expense =
                masterData.expenses.find(
                    function(item) {

                        return String(
                            item.expense_id
                        ) === String(
                            expenseId
                        );

                    }
                );


            if (!expense) {
                return;
            }


            const rate =
                Number(expense.cost) || 0;


            const expenseTotal =
                quantity * rate;


            total += expenseTotal;


            const totalElement =
                document.querySelector(
                    `[data-expense-total="${expenseId}"]`
                );


            if (totalElement) {

                totalElement.textContent =
                    money(expenseTotal);

            }

        });


    return total;

}


function calculateTotal() {

    const ingredientTotal =
        calculateIngredientTotal();


    const packagingTotal =
        calculatePackaging();

    const expenseTotal =
        calculateExpenses();
    
    const batchCost =
        ingredientTotal +
        packagingTotal +
        expenseTotal;


    const yieldQty =
        Number(
            document.getElementById(
                'yieldQty'
            ).value
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
        sellingPrice -
        costPerUnit;


    const batchProfit =
        profitPerUnit *
        yieldQty;


    document.getElementById(
        'ingredientTotal'
    ).textContent =
        money(ingredientTotal);


    document.getElementById(
        'batchCost'
    ).textContent =
        money(batchCost);


    document.getElementById(
        'costPerUnit'
    ).textContent =
        money(costPerUnit);


    document.getElementById(
        'sellingPrice'
    ).textContent =
        money(sellingPrice);


    document.getElementById(
        'profitPerUnit'
    ).textContent =
        money(profitPerUnit);


    document.getElementById(
        'batchProfit'
    ).textContent =
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

function showLoading() {
    document.getElementById(
        'loading'
    ).style.display = 'block';

    document.getElementById(
        'calculator'
    ).style.display = 'none';

    document.getElementById(
        'loading'
    ).innerHTML =
        'Loading masterlist...';
}

function hideLoading() {
    document.getElementById(
        'loading'
    ).style.display = 'none';

    document.getElementById(
        'calculator'
    ).style.display = 'block';
}

function showAdmin() {
    document
        .getElementById('calculator')
        .style.display = 'none';

    document
        .getElementById('adminPanel')
        .style.display = 'block';

    if (adminAuthenticated) {
        document
            .getElementById('adminLogin')
            .style.display = 'none';

        document
            .getElementById('adminDashboard')
            .style.display = 'block';

        loadAdminTables();
    } else {
        document
            .getElementById('adminLogin')
            .style.display = 'block';

        document
            .getElementById('adminDashboard')
            .style.display = 'none';

    }
}

function showCalculator() {
    document
        .getElementById('adminPanel')
        .style.display = 'none';

    document
        .getElementById('calculator')
        .style.display = 'block';
}


function adminLogout() {
    adminAuthenticated = false;

    adminPin = '';

    document
        .getElementById('adminPin')
        .value = '';

    showCalculator();
}

function showError(message) {

    document.getElementById(
        'loading'
    ).style.display = 'block';


    document.getElementById(
        'calculator'
    ).style.display = 'none';


    document.getElementById(
        'loading'
    ).innerHTML = `

        <div class="error">

            <strong>Unable to load masterlist</strong>

            <br><br>

            ${message}

        </div>

    `;

}
