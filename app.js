const API_URL =
    'https://script.google.com/macros/s/AKfycbz0vvhYGvOFoszUtXq3Vp_tzMMfjCTibBhO7utFe9Yj4lAz-MY9vn8C0agCOnAr-e6G/exec';

console.log('BAKING API URL:', API_URL);

let adminAuthenticated = false;

let adminPin = '';
let adminModalType = null;
let adminModalMode = 'add';
let adminModalId = null;

let masterData = {
    ingredients: [],
    recipes: [],
    recipeIngredients: [],
    packaging: [],
    expenses: []
};

document.addEventListener('DOMContentLoaded', function () {
    setupEvents();
    showCalculator();
    loadMasterlist();
    // setupAdminTabs();
});

function loadAdminTables() {
    populateIngredientsAdmin();
    populatePackagingAdmin();
    populateExpensesAdmin();
    populateRecipesAdmin();
    populateRecipeIngredientsAdmin();
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
                <td> ${item.ingredient_id} </td>
                <td> ${item.ingredient_name} </td>
                <td> ${item.unit} </td>
                <td> ${item.purchase_qty} </td>
                <td> ${money(item.purchase_price)} </td>
                <td> ${money(item.cost_per_unit)} </td>
                <td>
                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="openAdminModal('ingredient', 'edit', '${item.ingredient_id}')"
                    >
                        ✏ Edit
                    </button>
                </td>
            `;
        
            //clark comment 08/26/2026
            // onclick="editIngredient('${item.ingredient_id}')"
            tbody.appendChild(row);
        }
    );
}

function populateRecipesAdmin() {

    const tbody =
        document.getElementById(
            'recipesAdminTable'
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = '';

    masterData.recipes.forEach(function(recipe) {

        const tr =
            document.createElement('tr');

        tr.innerHTML = `

            <td>
                ${recipe.recipe_id}
            </td>

            <td>
                ${recipe.recipe_name}
            </td>

            <td>
                ${recipe.yield_qty}
            </td>

            <td>
                ${recipe.yield_unit}
            </td>

            <td>
                <button
                    type="button"
                    class="btn btn-small btn-primary"
                    onclick="openAdminModal('recipe', 'edit', '${recipe.recipe_id}')"
                >
                    Edit
                </button>

            </td>

        `;

        tbody.appendChild(tr);

    });

}

function populateRecipeIngredientsAdmin() {

    const tbody =
        document.getElementById(
            'recipeIngredientsAdminTable'
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = '';

    masterData.recipeIngredients
        .forEach(function(item) {

            const recipe =
                masterData.recipes.find(
                    r =>
                        String(r.recipe_id) ===
                        String(item.recipe_id)
                );

            const ingredient =
                masterData.ingredients.find(
                    i =>
                        String(i.ingredient_id) ===
                        String(item.ingredient_id)
                );

            const tr =
                document.createElement('tr');

            tr.innerHTML = `
                <td>
                    ${recipe
                        ? recipe.recipe_name
                        : item.recipe_id}
                </td>
                <td>
                    ${ingredient
                        ? ingredient.ingredient_name
                        : item.ingredient_id}
                </td>
                <td>
                    ${item.quantity}
                </td>
                <td>
                    ${item.unit}
                </td>
                <td>
                    ${item.notes || ''}
                </td>
                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="openAdminModal('recipeIngredients', 'edit',
                            '${item.recipe_id}',
                            '${item.ingredient_id}'
                        )"
                    >
                        Edit
                    </button>

                </td>

            `;

            tbody.appendChild(tr);

        });
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
                <td> ${item.packaging_id} </td>
                <td> ${item.packaging_name} </td>
                <td> ${item.unit} </td>
                <td> ${money(item.cost)} </td>
                <td>
                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="openAdminModal('packaging', 'edit', '${item.packaging_id}')"
                    >
                        ✏ Edit
                    </button>
                </td>
            `;
            //clark comment 08/26/2026
            // onclick="editPackaging('${item.packaging_id}')"
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
                <td> ${item.expense_id} </td>
                <td> ${item.expense_name} </td>
                <td> ${item.unit} </td>
                <td> ${money(item.cost)} </td>
                <td>
                    <button
                        type="button"
                        class="btn btn-small btn-primary"
                        onclick="openAdminModal('expense', 'edit', '${item.expense_id}')"
                    >
                        ✏ Edit
                    </button>
                </td>
            `;
            //clark comment 08/26/2026
            // onclick="editExpense('${item.expense_id}')"
            tbody.appendChild(row);
        }
    );
}

function saveAdminModal() {
    if (adminModalType === 'ingredient') {
        saveIngredient();
        return;
    }

    if (adminModalType === 'recipe') {
        saveRecipe();
        return;    
    }

    if (adminModalType === 'packaging') {
        savePackaging();
        return;
    }

    if (adminModalType === 'expense') {
        saveExpense();
        return;
    }
}

function saveIngredient() {
    const name = document.getElementById('adminIngredientName').value.trim();

    const unit = document .getElementById('adminIngredientUnit').value;

    const qty =
        Number(
            document.getElementById('adminPurchaseQty').value
        );

    const price =
        Number(
            document.getElementById('adminPurchasePrice').value
        );

    if (
        !name ||
        !unit ||
        qty <= 0 ||
        price < 0
    ) {

        alert(
            'Please complete all ingredient fields.'
        );
        
        return;
    }

    if (
        adminModalMode === 'add'
    ) {
        sendAdminAdd(
            'Ingredients',
            {
                ingredient_name: name,
                unit: unit,
                purchase_qty: qty,
                purchase_price: price
            }
        );
    }else{
        updateMasterlist(
            'Ingredients',
            {
                id: adminModalId,
                ingredient_name: name,
                unit: unit,
                purchase_qty: qty,
                purchase_price: price
            }
        );
    }
}

function saveRecipe() {

    const name =
        document
            .getElementById(
                'adminRecipeName'
            )
            .value
            .trim();

    const yieldQty =
        Number(
            document
                .getElementById(
                    'adminRecipeYieldQty'
                )
                .value
        );

    const yieldUnit =
        document
            .getElementById(
                'adminRecipeYieldUnit'
            )
            .value;

    if (
        !name ||
        yieldQty <= 0 ||
        !yieldUnit
    ) {
        alert(
            'Please complete all recipe fields.'
        );
        return;
    }

    const data = {
        recipe_name: name,
        yield_qty: yieldQty,
        yield_unit: yieldUnit

    };

    if (
        adminModalMode === 'add'
    ) {
        sendAdminAdd(
            'Recipes',
            data
        );
    }else {
        data.id = adminModalId;
        updateMasterlist(
            'Recipes',
            data
        );
    }
}

function savePackaging() {
    const name = document.getElementById('adminPackagingName').value.trim();

    const unit = document.getElementById('adminPackagingUnit').value.trim();

    const cost =
        Number(
            document
                .getElementById(
                    'adminPackagingCost'
                )
                .value
        );

    if (
        !name ||
        !unit ||
        cost < 0
    ) {
        alert(
            'Please complete all packaging fields.'
        );
        return;
    }

    const data = {
        id: adminModalId,
        packaging_name: name,
        unit: unit,
        cost: cost
    };

    if(adminModalMode === 'add') {
        delete data.id;
        sendAdminAdd(
            'Packaging',
            data
        );
    }else{
        updateMasterlist(
            'Packaging',
            data
        );
    }
}

function saveExpense() {
    const name =
        document
            .getElementById(
                'adminExpenseName'
            )
            .value
            .trim();

    const unit =
        document
            .getElementById(
                'adminExpenseUnit'
            )
            .value
            .trim();

    const cost =
        Number(
            document
                .getElementById(
                    'adminExpenseCost'
                )
                .value
        );

    if (
        !name ||
        !unit ||
        cost < 0
    ) {
        alert(
            'Please complete all expense fields.'
        );
        return;
    }

    const data = {
        id: adminModalId,
        expense_name: name,
        unit: unit,
        cost: cost
    };

    if (
        adminModalMode === 'add'
    ) {
        delete data.id;

        sendAdminAdd(
            'Expenses',
            data
        );
    }else {
        updateMasterlist(
            'Expenses',
            data
        );
    }
}

function sendAdminAdd(
    sheet,
    data
) {
    const callbackName =
        'addCallback_' +
        Date.now();

    window[callbackName] =
        function(response) {
            console.log(
                'ADD RESPONSE:',
                response
            );

            if (
                response &&
                response.success
            ) {
                closeAdminModal();

                alert(
                    'Added successfully!'
                );

                loadMasterlist();
            }else {
                alert(
                    response.error ||
                    'Unable to add item.'
                );
            }

            delete window[callbackName];
        };

    const params =
        new URLSearchParams();

    params.append(
        'action',
        'add'
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

function editIngredient(id) {
    openAdminModal(
        'ingredient',
        'edit',
        id
    );
}

function editPackaging(id) {
    openAdminModal(
        'packaging',
        'edit',
        id
    );
}

function editExpense(id) {
    openAdminModal(
        'expense',
        'edit',
        id
    );
}

// function editIngredient(id) {
//     const item =
//         masterData.ingredients.find(
//             function(x) {

//                 return String(
//                     x.ingredient_id
//                 ) === String(id);

//             }
//         );


//     if (!item) {
//         return;
//     }

//     const name =
//         prompt(
//             'Ingredient name:',
//             item.ingredient_name
//         );

//     if (name === null) {
//         return;
//     }

//     const quantity =
//         prompt(
//             'Purchase quantity (' +
//             item.unit +
//             '):',
//             item.purchase_qty
//         );

//     if (quantity === null) {
//         return;
//     }

//     const price =
//         prompt(
//             'Purchase price:',
//             item.purchase_price
//         );

//     if (price === null) {
//         return;
//     }

//     updateMasterlist(
//         'Ingredients',
//         {
//             id: item.ingredient_id,
//             ingredient_name: name,
//             unit: item.unit,
//             purchase_qty: quantity,
//             purchase_price: price
//         }
//     );
// }

// function editPackaging(id) {
//     const item =
//         masterData.packaging.find(
//             function(x) {
//                 return String(
//                     x.packaging_id
//                 ) === String(id);
//             }
//         );

//     if (!item) {
//         return;
//     }

//     const name =
//         prompt(
//             'Packaging name:',
//             item.packaging_name
//         );

//     if (name === null) {
//         return;
//     }

//     const cost =
//         prompt(
//             'Packaging cost:',
//             item.cost
//         );

//     if (cost === null) {
//         return;
//     }

//     updateMasterlist(
//         'Packaging',
//         {
//             id: item.packaging_id,
//             packaging_name: name,
//             unit: item.unit,
//             cost: cost
//         }
//     );
// }

// function editExpense(id) {
//     const item =
//         masterData.expenses.find(
//             function(x) {

//                 return String(
//                     x.expense_id
//                 ) === String(id);

//             }
//         );

//     if (!item) {
//         return;
//     }

//     const name =
//         prompt(
//             'Expense name:',
//             item.expense_name
//         );

//     if (name === null) {
//         return;
//     }

//     const cost =
//         prompt(
//             'Cost per ' + item.unit + ':',
//             item.cost
//         );

//     if (cost === null) {
//         return;
//     }

//     updateMasterlist(
//         'Expenses',
//         {
//             id: item.expense_id,

//             expense_name: name,

//             unit: item.unit,

//             cost: cost
//         }
//     );
// }

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

function switchAdminTab(tabId, button){
    
    document.querySelectorAll('.admin-tab-content')
        .forEach(function(tab) {
            tab.style.display =
                'none';
        });

    document.querySelectorAll('.admin-tab')
        .forEach(function(tabButton) {
            tabButton.classList.remove('active');
        });

    document.getElementById(tabId).style.display = 'block';
    button.classList.add('active');
}

function adminLogin() {
    const pin =
        document.getElementById('adminPin').value.trim();

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

            }else{
                showAdminLoginError(
                    data.error ||
                    'Invalid PIN.'
                );
            }

            delete window[callbackName];
        };

    const script = document.createElement('script');

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

function showAdminLoginError(message) {
    const error =
        document.getElementById('adminLoginError');

    if (!error) {
        alert(message);
        return;
    }

    error.textContent = message;
    error.style.display = 'block';
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

            // Refresh calculator controls
            populateRecipes();
            populatePackaging();
            populateExpenses();
            // hideLoading();

            // Refresh admin tables ONLY if admin is currently open
            if (adminAuthenticated) {
                loadAdminTables();
            }

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

    //clark newly added 08/26/2026
    closeAdminModal();
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

    document
        .getElementById('addIngredientButton')
        .addEventListener('click', function() {
            openAdminModal(
                'ingredient',
                'add'
            );
        });

    document
    .getElementById('addRecipeButton')
    .addEventListener(
        'click',
        function() {
            openAdminModal(
                'recipe',
                'add'
            );
        }
    );
    
    document
        .getElementById('addPackagingButton')
        .addEventListener('click', function() {
            openAdminModal(
                'packaging',
                'add'
            );
        });
    
    document
        .getElementById('addExpenseButton')
        .addEventListener('click', function() {
            openAdminModal(
                'expense',
                'add'
            );
        });

    document.getElementById('adminModalClose').addEventListener('click', closeAdminModal);
    document.getElementById('adminModalCancel').addEventListener('click', closeAdminModal);
    document.getElementById('adminModalSave').addEventListener('click', saveAdminModal);
}

function populateRecipes() {

    const select =
        document.getElementById('recipeSelect');

    select.innerHTML = '<option value="">Select recipe</option>';

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

// function showLoading() {
//     document.getElementById(
//         'loading'
//     ).style.display = 'block';

//     document.getElementById(
//         'calculator'
//     ).style.display = 'none';

//     document.getElementById(
//         'loading'
//     ).innerHTML =
//         'Loading masterlist...';
// }

// function hideLoading() {
//     document.getElementById(
//         'loading'
//     ).style.display = 'none';

//     document.getElementById(
//         'calculator'
//     ).style.display = 'block';
// }

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

function openAdminModal(
    type,
    mode = 'add',
    id = null
) {

    adminModalType = type;
    adminModalMode = mode;
    adminModalId = id;

    const title =
        document.getElementById(
            'adminModalTitle'
        );

    const body =
        document.getElementById(
            'adminModalBody'
        );

    title.textContent =
        mode === 'add'
            ? 'Add ' + getAdminTypeName(type)
            : 'Edit ' + getAdminTypeName(type);

    body.innerHTML =
        getAdminForm(type, mode, id);

    document.getElementById('adminModal').style.display = 'flex';
}

function getAdminTypeName(type) {

    if (type === 'ingredient') {
        return 'Ingredient';
    }

    if (type === 'packaging') {
        return 'Packaging';
    }

    if (type === 'expense') {
        return 'Expense';
    }

    if (type === 'recipe') {
        return 'Recipe';
    }

    if (type === 'recipeIngredient') {
        return 'Recipe Ingredient';
    }

    return 'Item';
}

function getAdminForm(
    type,
    mode,
    id
) {
    let item = null;

    if (mode === 'edit') {
        if (type === 'ingredient') {
            item =
                masterData.ingredients.find(
                    x =>
                        String(
                            x.ingredient_id
                        ) === String(id)
                );
        }
        
        if (type === 'recipe') {
            item =
                masterData.recipes.find(
                    x =>
                        String(
                            x.recipe_id
                        ) === String(id)
                );
        }
        
        if (type === 'packaging') {
            item =
                masterData.packaging.find(
                    x =>
                        String(
                            x.packaging_id
                        ) === String(id)
                );
        }

        if (type === 'expense') {
            item =
                masterData.expenses.find(
                    x =>
                        String(
                            x.expense_id
                        ) === String(id)
                );
        }
    }

    if (type === 'ingredient') {
        return `
            <div class="form-group">
                <label>
                    Ingredient Name
                </label>

                <input
                    id="adminIngredientName"
                    value="${item?.ingredient_name || ''}"
                    placeholder="e.g. All Purpose Flour"
                >
            </div>

            <div class="form-group">
                <label>
                    Unit
                </label>

                <select id="adminIngredientUnit">

                    <option value="g"
                        ${item?.unit === 'g' ? 'selected' : ''}>
                        g
                    </option>

                    <option value="kg"
                        ${item?.unit === 'kg' ? 'selected' : ''}>
                        kg
                    </option>

                    <option value="ml"
                        ${item?.unit === 'ml' ? 'selected' : ''}>
                        ml
                    </option>

                    <option value="l"
                        ${item?.unit === 'l' ? 'selected' : ''}>
                        l
                    </option>

                    <option value="pc"
                        ${item?.unit === 'pc' ? 'selected' : ''}>
                        pc
                    </option>

                </select>
            </div>

            <div class="form-group">
                <label>
                    Purchase Quantity
                </label>

                <input
                    type="number"
                    id="adminPurchaseQty"
                    value="${item?.purchase_qty || ''}"
                    min="0"
                    step="0.01"
                >
            </div>

            <div class="form-group">
                <label>
                    Purchase Price
                </label>

                <input
                    type="number"
                    id="adminPurchasePrice"
                    value="${item?.purchase_price || ''}"
                    min="0"
                    step="0.01"
                >
            </div>
        `;
    }

    if (type === 'recipe') {
        let item = null;
    
        if (mode === 'edit') {
    
            item =
                masterData.recipes.find(
                    x =>
                        String(x.recipe_id) ===
                        String(id)
                );
    
        }
    
        return `
    
            <div class="form-group">
    
                <label>
                    Recipe Name
                </label>
    
                <input
                    type="text"
                    id="adminRecipeName"
                    value="${item?.recipe_name || ''}"
                    placeholder="e.g. Chocolate Cake"
                >
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Yield Quantity
                </label>
    
                <input
                    type="number"
                    id="adminRecipeYieldQty"
                    value="${item?.yield_qty || ''}"
                    min="0"
                    step="0.01"
                >
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Yield Unit
                </label>
    
                <select id="adminRecipeYieldUnit">
    
                    <option value="pcs"
                        ${item?.yield_unit === 'pcs'
                            ? 'selected'
                            : ''}>
                        Pieces
                    </option>
    
                    <option value="loaves"
                        ${item?.yield_unit === 'loaves'
                            ? 'selected'
                            : ''}>
                        Loaves
                    </option>
    
                    <option value="cakes"
                        ${item?.yield_unit === 'cakes'
                            ? 'selected'
                            : ''}>
                        Cakes
                    </option>
    
                    <option value="boxes"
                        ${item?.yield_unit === 'boxes'
                            ? 'selected'
                            : ''}>
                        Boxes
                    </option>
    
                </select>
    
            </div>
    
        `;
    }

    if (type === 'recipeIngredient') {
        let item = null;
    
        if (mode === 'edit') {
    
            item =
                masterData.recipeIngredients.find(
                    x =>
                        String(x.recipe_id) ===
                            String(id.recipe_id) &&
                        String(x.ingredient_id) ===
                            String(id.ingredient_id)
                );
    
        }

        const recipeOptions =
            masterData.recipes
                .map(function(recipe) {
    
                    return `
                        <option
                            value="${recipe.recipe_id}"
                            ${item?.recipe_id === recipe.recipe_id
                                ? 'selected'
                                : ''}
                        >
                            ${recipe.recipe_name}
                        </option>
                    `;
    
                })
                .join('');
    
        const ingredientOptions =
            masterData.ingredients
                .map(function(ingredient) {
    
                    return `
                        <option
                            value="${ingredient.ingredient_id}"
                            ${item?.ingredient_id === ingredient.ingredient_id
                                ? 'selected'
                                : ''}
                        >
                            ${ingredient.ingredient_name}
                        </option>
                    `;
    
                })
                .join('');
    
    
        return `
    
            <div class="form-group">
    
                <label>
                    Recipe
                </label>
    
                <select
                    id="adminRecipeIngredientRecipe"
                >
    
                    <option value="">
                        Select Recipe
                    </option>
    
                    ${recipeOptions}
    
                </select>
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Ingredient
                </label>
    
                <select
                    id="adminRecipeIngredientIngredient"
                >
    
                    <option value="">
                        Select Ingredient
                    </option>
    
                    ${ingredientOptions}
    
                </select>
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Quantity
                </label>
    
                <input
                    type="number"
                    id="adminRecipeIngredientQuantity"
                    value="${item?.quantity || ''}"
                    min="0"
                    step="0.01"
                >
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Unit
                </label>
    
                <input
                    type="text"
                    id="adminRecipeIngredientUnit"
                    value="${item?.unit || ''}"
                    placeholder="g / ml / pc"
                >
    
            </div>
    
    
            <div class="form-group">
    
                <label>
                    Notes
                </label>
    
                <input
                    type="text"
                    id="adminRecipeIngredientNotes"
                    value="${item?.notes || ''}"
                >
    
            </div>
    
        `;
    
    }
    
    if (type === 'packaging') {
        return `
            <div class="form-group">

                <label>
                    Packaging Name
                </label>

                <input
                    id="adminPackagingName"
                    value="${item?.packaging_name || ''}"
                    placeholder="e.g. Cookie Box"
                >

            </div>


            <div class="form-group">

                <label>
                    Unit
                </label>

                <input
                    id="adminPackagingUnit"
                    value="${item?.unit || 'pc'}"
                >

            </div>

            <div class="form-group">
                <label>
                    Cost
                </label>

                <input
                    type="number"
                    id="adminPackagingCost"
                    value="${item?.cost || ''}"
                    min="0"
                    step="0.01"
                >
            </div>
        `;
    }

    if (type === 'expense') {

        return `

            <div class="form-group">

                <label>
                    Expense Name
                </label>

                <input
                    id="adminExpenseName"
                    value="${item?.expense_name || ''}"
                    placeholder="e.g. Labor"
                >

            </div>


            <div class="form-group">

                <label>
                    Unit
                </label>

                <input
                    id="adminExpenseUnit"
                    value="${item?.unit || 'batch'}"
                    placeholder="e.g. batch"
                >

            </div>


            <div class="form-group">

                <label>
                    Cost
                </label>

                <input
                    type="number"
                    id="adminExpenseCost"
                    value="${item?.cost || ''}"
                    min="0"
                    step="0.01"
                >

            </div>

        `;
    }

    return '';
}

function closeAdminModal() {
    console.log('admin modal close');
    document.getElementById('adminModal').style.display = 'none';
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
    // document.getElementById(
    //     'loading'
    // ).style.display = 'block';

    document.getElementById(
        'calculator'
    ).style.display = 'none';

    // document.getElementById(
    //     'loading'
    // ).innerHTML = `

    //     <div class="error">
    //         <strong>Unable to load masterlist</strong>
    //         <br><br>
    //         ${message}
    //     </div>
    // `;
}
