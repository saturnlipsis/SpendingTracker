// ==========================================
// SPENDING TRACKER
// ==========================================


// ==========================================
// STORAGE
// ==========================================

const STORAGE_KEY = "spendingTrackerData";

let data = loadData();

let currentMonth = getCurrentMonth();

let selectedCategoryId = null;

let editingCategoryId = null;

let expenseToDeleteId = null;


// ==========================================
// DATA
// ==========================================

function createEmptyData() {
    return {
        months: {},
        categories: [],
        expenses: []
    };
}


function loadData() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return createEmptyData();
    }

    try {

        const parsed =
            JSON.parse(saved);

        // Make sure older saved data still works
        if (!parsed.months) {
            parsed.months = {};
        }

        if (!parsed.categories) {
            parsed.categories = [];
        }

        if (!parsed.expenses) {
            parsed.expenses = [];
        }

        return parsed;

    } catch (error) {

        console.error(
            "Could not load saved data:",
            error
        );

        return createEmptyData();
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


// ==========================================
// IDs
// ==========================================

function createId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


// ==========================================
// MONTHS
// ==========================================

function getCurrentMonth() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


function getMonthData(month) {

    if (!data.months[month]) {

        data.months[month] = {
            available: 0
        };

        saveData();
    }

    return data.months[month];
}


function getMonthDate(month) {

    const [
        year,
        monthNumber
    ] = month.split("-");

    return new Date(
        Number(year),
        Number(monthNumber) - 1,
        1
    );
}


function formatMonth(month) {

    return getMonthDate(month)
        .toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );
}


function changeMonth(amount) {

    const date =
        getMonthDate(currentMonth);

    date.setMonth(
        date.getMonth() + amount
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    currentMonth =
        `${year}-${month}`;

    renderViewExpenses();
}


// ==========================================
// MONEY
// ==========================================

function formatMoney(amount) {

    return `€${Number(amount).toFixed(2)}`;
}


function getAvailableMoney(month) {

    return getMonthData(month).available;
}


function getMonthExpenses(month) {

    return data.expenses.filter(
        expense =>
            expense.month === month
    );
}


function getTotalSpent(month) {

    return getMonthExpenses(month)
        .reduce(
            (total, expense) =>
                total +
                Number(expense.amount),
            0
        );
}


function getRemainingMoney(month) {

    const available =
        getAvailableMoney(month);

    const spent =
        getTotalSpent(month);

    return available - spent;
}


function updateHomeMoney() {

    const month =
        getCurrentMonth();

    const available =
        getAvailableMoney(month);

    const spent =
        getTotalSpent(month);

    const remaining =
        available - spent;


    const button =
        document.getElementById(
            "availableMoneyButton"
        );


    if (!button) {
        return;
    }


    button.textContent =
        formatMoney(remaining);
}


// ==========================================
// NAVIGATION
// ==========================================

function showScreen(screenId) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove(
                "active"
            );

        });


    const screen =
        document.getElementById(
            screenId
        );


    if (!screen) {
        return;
    }


    screen.classList.add(
        "active"
    );


    if (screenId === "homeScreen") {

        updateHomeMoney();

    }


    if (screenId === "addExpenseScreen") {

        prepareAddExpenseScreen();

    }


    if (screenId === "categoriesScreen") {

        renderCategories();

    }


    if (screenId === "viewExpensesScreen") {

        renderViewExpenses();

    }
}


// ==========================================
// AVAILABLE MONEY
// ==========================================

function openMoneyModal() {

    const modal =
        document.getElementById(
            "moneyModal"
        );

    const input =
        document.getElementById(
            "availableMoneyInput"
        );


    const currentAmount =
        getAvailableMoney(
            getCurrentMonth()
        );


    input.value =
        currentAmount || "";


    modal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => input.focus(),
        50
    );
}


function closeMoneyModal() {

    document
        .getElementById(
            "moneyModal"
        )
        .classList.add(
            "hidden"
        );
}


function saveAvailableMoney() {

    const input =
        document.getElementById(
            "availableMoneyInput"
        );


    const amount =
        Number(input.value);


    if (
        input.value === "" ||
        isNaN(amount) ||
        amount < 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;
    }


    const month =
        getCurrentMonth();


    getMonthData(
        month
    ).available =
        amount;


    saveData();

    closeMoneyModal();

    updateHomeMoney();
}


// ==========================================
// ADD EXPENSE
// ==========================================

function prepareAddExpenseScreen() {

    const categories =
        data.categories;


    const selector =
        document.getElementById(
            "categorySelector"
        );


    if (categories.length === 0) {

        selector.textContent =
            "Create";

        selector.dataset.categoryId =
            "";

        checkExpenseForm();

        return;
    }


    if (categories.length === 1) {

        selector.textContent =
            categories[0].name;

        selector.dataset.categoryId =
            categories[0].id;

        checkExpenseForm();

        return;
    }


    if (
        !selector.dataset.categoryId ||
        !categories.some(
            category =>
                category.id ===
                selector.dataset.categoryId
        )
    ) {

        selector.textContent =
            "Choose";

        selector.dataset.categoryId =
            "";
    }


    checkExpenseForm();
}


// ==========================================
// DATE
// ==========================================

function setDefaultExpenseDate() {

    const input =
        document.getElementById(
            "expenseDate"
        );


    if (!input) {
        return;
    }


    if (!input.value) {

        const today =
            new Date();


        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        input.value =
            `${year}-${month}-${day}`;
    }
}


// ==========================================
// EXPENSE FORM
// ==========================================

function checkExpenseForm() {

    const name =
        document.getElementById(
            "expenseName"
        ).value.trim();


    const amount =
        document.getElementById(
            "expenseAmount"
        ).value;


    const date =
        document.getElementById(
            "expenseDate"
        ).value;


    const categoryId =
        document
            .getElementById(
                "categorySelector"
            )
            .dataset.categoryId;


    const button =
        document.getElementById(
            "saveExpenseButton"
        );


    const complete =
        name !== "" &&
        amount !== "" &&
        Number(amount) > 0 &&
        date !== "" &&
        categoryId !== "";


    if (complete) {

        button.classList.remove(
            "hidden"
        );

    } else {

        button.classList.add(
            "hidden"
        );
    }
}


// ==========================================
// CATEGORY SELECTOR
// ==========================================

function toggleCategoryDropdown() {

    const categories =
        data.categories;


    if (categories.length === 0) {

        openCreateCategory(
            "addExpenseScreen"
        );

        return;
    }


    if (categories.length === 1) {

        const category =
            categories[0];


        const selector =
            document.getElementById(
                "categorySelector"
            );


        selector.textContent =
            category.name;


        selector.dataset.categoryId =
            category.id;


        checkExpenseForm();

        return;
    }


    const dropdown =
        document.getElementById(
            "categoryDropdown"
        );


    dropdown.classList.toggle(
        "hidden"
    );


    renderCategoryDropdown();
}


function renderCategoryDropdown() {

    const list =
        document.getElementById(
            "categoryList"
        );


    list.innerHTML = "";


    data.categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-option";


            button.type =
                "button";


            button.textContent =
                category.name;


            button.addEventListener(
                "click",
                () => {

                    const selector =
                        document.getElementById(
                            "categorySelector"
                        );


                    selector.textContent =
                        category.name;


                    selector.dataset.categoryId =
                        category.id;


                    document
                        .getElementById(
                            "categoryDropdown"
                        )
                        .classList.add(
                            "hidden"
                        );


                    checkExpenseForm();
                }
            );


            list.appendChild(
                button
            );
        }
    );
}


// ==========================================
// SAVE EXPENSE
// ==========================================

function saveExpense() {

    const name =
        document
            .getElementById(
                "expenseName"
            )
            .value
            .trim();


    const amount =
        Number(
            document
                .getElementById(
                    "expenseAmount"
                )
                .value
        );


    const date =
        document
            .getElementById(
                "expenseDate"
            )
            .value;


    const categoryId =
        document
            .getElementById(
                "categorySelector"
            )
            .dataset.categoryId;


    if (
        !name ||
        !categoryId ||
        !date ||
        isNaN(amount) ||
        amount <= 0
    ) {

        return;
    }


    const selectedDate =
        new Date(
            `${date}T12:00:00`
        );


    if (
        isNaN(
            selectedDate.getTime()
        )
    ) {

        return;
    }


    const expenseMonth =
        `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1
        ).padStart(2, "0")}`;


    const expense = {

        id:
            createId(),

        name:
            name,

        amount:
            amount,

        categoryId:
            categoryId,

        month:
            expenseMonth,

        date:
            date

    };


    data.expenses.push(
        expense
    );


    // Make sure the month exists
    getMonthData(
        expenseMonth
    );


    saveData();


    clearExpenseForm();


    showScreen(
        "homeScreen"
    );
}


// ==========================================
// CLEAR EXPENSE FORM
// ==========================================

function clearExpenseForm() {

    document
        .getElementById(
            "expenseName"
        )
        .value = "";


    document
        .getElementById(
            "expenseAmount"
        )
        .value = "";


    document
        .getElementById(
            "expenseDate"
        )
        .value = "";


    const selector =
        document.getElementById(
            "categorySelector"
        );


    selector.dataset.categoryId =
        "";


    selector.textContent =
        data.categories.length === 0
            ? "Create"
            : data.categories.length === 1
                ? data.categories[0].name
                : "Choose";


    document
        .getElementById(
            "categoryDropdown"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "saveExpenseButton"
        )
        .classList.add(
            "hidden"
        );
}


// ==========================================
// CREATE CATEGORY
// ==========================================

function openCreateCategory(
    returnTo
) {

    document
        .getElementById(
            "categoryName"
        )
        .value = "";


    document
        .getElementById(
            "categoryLimit"
        )
        .value = "";


    document
        .getElementById(
            "createCategoryScreen"
        )
        .dataset.returnTo =
        returnTo;


    showScreen(
        "createCategoryScreen"
    );
}


function saveCategory() {

    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();


    const limitInput =
        document.getElementById(
            "categoryLimit"
        );


    const limit =
        Number(
            limitInput.value
        );


    if (!name) {

        alert(
            "Please enter a category name."
        );

        return;
    }


    if (
        limitInput.value === "" ||
        isNaN(limit) ||
        limit < 0
    ) {

        alert(
            "Please enter a valid monthly limit."
        );

        return;
    }


    const category = {

        id:
            createId(),

        name:
            name,

        limit:
            limit

    };


    data.categories.push(
        category
    );


    saveData();


    const returnTo =
        document
            .getElementById(
                "createCategoryScreen"
            )
            .dataset.returnTo ||
        "categoriesScreen";


    if (
        returnTo ===
        "addExpenseScreen"
    ) {

        const selector =
            document.getElementById(
                "categorySelector"
            );


        selector.textContent =
            category.name;


        selector.dataset.categoryId =
            category.id;


        showScreen(
            "addExpenseScreen"
        );


        checkExpenseForm();


        return;
    }


    showScreen(
        "categoriesScreen"
    );
}


// ==========================================
// CATEGORIES
// ==========================================

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesList"
        );


    container.innerHTML = "";


    if (
        data.categories.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.className =
            "empty-message";


        message.textContent =
            "You haven't created any categories yet.";


        container.appendChild(
            message
        );


        return;
    }


    data.categories.forEach(
        category => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "category-card";


            card.innerHTML = `

                <div class="category-card-info">

                    <span class="category-card-name">
                        ${escapeHTML(
                            category.name
                        )}
                    </span>

                    <span class="category-card-limit">
                        Monthly limit:
                        ${formatMoney(
                            category.limit
                        )}
                    </span>

                </div>

                <div class="category-card-actions">

                    <button
                        type="button"
                        class="delete-category-button"
                        data-category-id="${category.id}"
                        aria-label="Delete category"
                    >
                        🗑
                    </button>

                    <span class="category-arrow">
                        ›
                    </span>

                </div>
            `;


            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".delete-category-button"
                        )
                    ) {
                        return;
                    }


                    openEditCategory(
                        category.id
                    );
                }
            );


            const deleteButton =
                card.querySelector(
                    ".delete-category-button"
                );


            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deleteCategory(
                        category.id
                    );
                }
            );


            container.appendChild(
                card
            );
        }
    );
}


// ==========================================
// DELETE CATEGORY
// ==========================================

function deleteCategory(
    categoryId
) {

    const category =
        data.categories.find(
            category =>
                category.id ===
                categoryId
        );


    if (!category) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${category.name}" and all its expenses?`
        );


    if (!confirmed) {
        return;
    }


    data.categories =
        data.categories.filter(
            category =>
                category.id !==
                categoryId
        );


    data.expenses =
        data.expenses.filter(
            expense =>
                expense.categoryId !==
                categoryId
        );


    if (
        selectedCategoryId ===
        categoryId
    ) {

        selectedCategoryId =
            null;
    }


    saveData();


    renderCategories();


    updateHomeMoney();
}


// ==========================================
// EDIT CATEGORY
// ==========================================

function openEditCategory(
    categoryId
) {

    const category =
        data.categories.find(
            category =>
                category.id ===
                categoryId
        );


    if (!category) {
        return;
    }


    editingCategoryId =
        categoryId;


    document
        .getElementById(
            "editCategoryName"
        )
        .value =
        category.name;


    document
        .getElementById(
            "editCategoryLimit"
        )
        .value =
        category.limit;


    showScreen(
        "editCategoryScreen"
    );
}


function updateCategory() {

    const category =
        data.categories.find(
            category =>
                category.id ===
                editingCategoryId
        );


    if (!category) {
        return;
    }


    const name =
        document
            .getElementById(
                "editCategoryName"
            )
            .value
            .trim();


    const limitInput =
        document.getElementById(
            "editCategoryLimit"
        );


    const limit =
        Number(
            limitInput.value
        );


    if (!name) {

        alert(
            "Please enter a category name."
        );

        return;
    }


    if (
        limitInput.value === "" ||
        isNaN(limit) ||
        limit < 0
    ) {

        alert(
            "Please enter a valid monthly limit."
        );

        return;
    }


    category.name =
        name;


    category.limit =
        limit;


    saveData();


    editingCategoryId =
        null;


    showScreen(
        "categoriesScreen"
    );
}


// ==========================================
// VIEW EXPENSES
// ==========================================

function renderViewExpenses() {

    document
        .getElementById(
            "currentMonthLabel"
        )
        .textContent =
        formatMonth(
            currentMonth
        );


    const total =
        getTotalSpent(
            currentMonth
        );


    document
        .getElementById(
            "totalSpent"
        )
        .textContent =
        formatMoney(total);


    renderExpenseCategories();

    renderMonthResult();
}


function renderExpenseCategories() {

    const container =
        document.getElementById(
            "expenseCategories"
        );


    container.innerHTML = "";


    if (
        data.categories.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.className =
            "empty-message";


        message.textContent =
            "You haven't created any categories yet.";


        container.appendChild(
            message
        );


        return;
    }


    data.categories.forEach(
        category => {

            const spent =
                getCategorySpent(
                    category.id,
                    currentMonth
                );


            const remaining =
                category.limit -
                spent;


            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "expense-category-card";


            const statusText =
                remaining >= 0
                    ? `${formatMoney(
                        remaining
                    )} remaining`
                    : `${formatMoney(
                        Math.abs(
                            remaining
                        )
                    )} over limit`;


            const statusClass =
                remaining >= 0
                    ? "category-under"
                    : "category-over";


            card.innerHTML = `

                <div class="expense-category-top">

                    <span class="expense-category-name">
                        ${escapeHTML(
                            category.name
                        )}
                    </span>

                    <span class="expense-category-amount">
                        ${formatMoney(
                            spent
                        )}
                    </span>

                </div>


                <div class="expense-category-bottom">

                    <span>
                        Limit:
                        ${formatMoney(
                            category.limit
                        )}
                    </span>

                    <span class="${statusClass}">
                        ${statusText}
                    </span>

                </div>
            `;


            card.addEventListener(
                "click",
                () => {

                    openCategoryDetail(
                        category.id
                    );

                }
            );


            container.appendChild(
                card
            );
        }
    );
}


// ==========================================
// MONTH RESULT
// ==========================================

function renderMonthResult() {

    const result =
        document.getElementById(
            "monthResult"
        );


    const available =
        getAvailableMoney(
            currentMonth
        );


    const spent =
        getTotalSpent(
            currentMonth
        );


    const remaining =
        available - spent;


    if (
        available === 0 &&
        spent === 0
    ) {

        result.textContent =
            "No available money or expenses recorded for this month.";

        return;
    }


    if (remaining > 0) {

        result.textContent =
            `You had ${formatMoney(
                remaining
            )} left at the end of this month.`;

    } else if (
        remaining === 0
    ) {

        result.textContent =
            "You had no money left at the end of this month.";

    } else {

        result.textContent =
            `You went ${formatMoney(
                Math.abs(
                    remaining
                )
            )} over your available money this month.`;
    }
}


// ==========================================
// CATEGORY DETAIL
// ==========================================

function getCategorySpent(
    categoryId,
    month
) {

    return data.expenses
        .filter(
            expense =>
                expense.categoryId ===
                    categoryId &&
                expense.month ===
                    month
        )
        .reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(
                    expense.amount
                ),
            0
        );
}


function openCategoryDetail(
    categoryId
) {

    selectedCategoryId =
        categoryId;


    const category =
        data.categories.find(
            category =>
                category.id ===
                categoryId
        );


    if (!category) {
        return;
    }


    document
        .getElementById(
            "categoryDetailTitle"
        )
        .textContent =
        category.name;


    const spent =
        getCategorySpent(
            categoryId,
            currentMonth
        );


    document
        .getElementById(
            "categoryDetailSpent"
        )
        .textContent =
        formatMoney(spent);


    document
        .getElementById(
            "categoryDetailLimit"
        )
        .textContent =
        `Limit: ${formatMoney(
            category.limit
        )}`;


    renderCategoryExpenses(
        categoryId
    );


    showScreen(
        "categoryDetailScreen"
    );
}


function renderCategoryExpenses(
    categoryId
) {

    const container =
        document.getElementById(
            "categoryExpensesList"
        );


    container.innerHTML = "";


    const expenses =
        data.expenses
            .filter(
                expense =>
                    expense.categoryId ===
                        categoryId &&
                    expense.month ===
                        currentMonth
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.date
                    ) -
                    new Date(
                        a.date
                    )
            );


    if (
        expenses.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.className =
            "empty-message";


        message.textContent =
            "No expenses in this category this month.";


        container.appendChild(
            message
        );


        return;
    }


    expenses.forEach(
        expense => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "expense-item";


            const date =
                new Date(
                    `${expense.date}T12:00:00`
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month:
                            "long",

                        day:
                            "numeric",

                        year:
                            "numeric"
                    }
                );


            item.innerHTML = `

                <div class="expense-item-info">

                    <span class="expense-item-name">
                        ${escapeHTML(
                            expense.name
                        )}
                    </span>

                    <span class="expense-item-date">
                        ${formattedDate}
                    </span>

                </div>


                <div class="expense-item-right">

                    <span class="expense-item-amount">
                        ${formatMoney(
                            expense.amount
                        )}
                    </span>

                    <button
                        type="button"
                        class="delete-expense-button"
                        data-expense-id="${expense.id}"
                        aria-label="Delete expense"
                    >
                        🗑
                    </button>

                </div>
            `;


            item
                .querySelector(
                    ".delete-expense-button"
                )
                .addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        openDeleteModal(
                            expense.id
                        );

                    }
                );


            container.appendChild(
                item
            );
        }
    );
}


// ==========================================
// DELETE EXPENSE
// ==========================================

function openDeleteModal(
    expenseId
) {

    expenseToDeleteId =
        expenseId;


    document
        .getElementById(
            "deleteModal"
        )
        .classList.remove(
            "hidden"
        );
}


function closeDeleteModal() {

    expenseToDeleteId =
        null;


    document
        .getElementById(
            "deleteModal"
        )
        .classList.add(
            "hidden"
        );
}


function deleteExpense() {

    if (!expenseToDeleteId) {
        return;
    }


    const expense =
        data.expenses.find(
            expense =>
                expense.id ===
                expenseToDeleteId
        );


    if (!expense) {

        closeDeleteModal();

        return;
    }


    data.expenses =
        data.expenses.filter(
            expense =>
                expense.id !==
                expenseToDeleteId
        );


    saveData();


    closeDeleteModal();


    if (selectedCategoryId) {

        renderCategoryExpenses(
            selectedCategoryId
        );


        const category =
            data.categories.find(
                category =>
                    category.id ===
                    selectedCategoryId
            );


        if (category) {

            const spent =
                getCategorySpent(
                    category.id,
                    currentMonth
                );


            document
                .getElementById(
                    "categoryDetailSpent"
                )
                .textContent =
                formatMoney(
                    spent
                );
        }
    }


    updateHomeMoney();
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


// ==========================================
// EVENT LISTENERS
// ==========================================

// Add expense

document
    .getElementById(
        "addExpenseButton"
    )
    .addEventListener(
        "click",
        () => {

            showScreen(
                "addExpenseScreen"
            );

        }
    );


// View expenses

document
    .getElementById(
        "viewExpensesButton"
    )
    .addEventListener(
        "click",
        () => {

            currentMonth =
                getCurrentMonth();

            showScreen(
                "viewExpensesScreen"
            );

        }
    );


// Categories

document
    .getElementById(
        "categoriesButton"
    )
    .addEventListener(
        "click",
        () => {

            showScreen(
                "categoriesScreen"
            );

        }
    );


// Available money

document
    .getElementById(
        "availableMoneyButton"
    )
    .addEventListener(
        "click",
        openMoneyModal
    );


document
    .getElementById(
        "addMoneyButton"
    )
    .addEventListener(
        "click",
        openMoneyModal
    );


// Money modal

document
    .getElementById(
        "cancelMoneyButton"
    )
    .addEventListener(
        "click",
        closeMoneyModal
    );


document
    .getElementById(
        "saveMoneyButton"
    )
    .addEventListener(
        "click",
        saveAvailableMoney
    );


// Category selector

document
    .getElementById(
        "categorySelector"
    )
    .addEventListener(
        "click",
        toggleCategoryDropdown
    );


// Create category from expense

document
    .getElementById(
        "createCategoryFromExpense"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "categoryDropdown"
                )
                .classList.add(
                    "hidden"
                );


            openCreateCategory(
                "addExpenseScreen"
            );

        }
    );


// Expense inputs

document
    .getElementById(
        "expenseName"
    )
    .addEventListener(
        "input",
        checkExpenseForm
    );


document
    .getElementById(
        "expenseAmount"
    )
    .addEventListener(
        "input",
        checkExpenseForm
    );


document
    .getElementById(
        "expenseDate"
    )
    .addEventListener(
        "change",
        checkExpenseForm
    );


// Save expense

document
    .getElementById(
        "saveExpenseButton"
    )
    .addEventListener(
        "click",
        saveExpense
    );


// Create category

document
    .getElementById(
        "createCategoryButton"
    )
    .addEventListener(
        "click",
        () => {

            openCreateCategory(
                "categoriesScreen"
            );

        }
    );


// Save category

document
    .getElementById(
        "saveCategoryButton"
    )
    .addEventListener(
        "click",
        saveCategory
    );


// Update category

document
    .getElementById(
        "updateCategoryButton"
    )
    .addEventListener(
        "click",
        updateCategory
    );


// Month navigation

document
    .getElementById(
        "previousMonthButton"
    )
    .addEventListener(
        "click",
        () =>
            changeMonth(-1)
    );


document
    .getElementById(
        "nextMonthButton"
    )
    .addEventListener(
        "click",
        () =>
            changeMonth(1)
    );


// Delete modal

document
    .getElementById(
        "cancelDeleteButton"
    )
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById(
        "confirmDeleteButton"
    )
    .addEventListener(
        "click",
        deleteExpense
    );


// Back buttons

document
    .querySelectorAll(
        ".back-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showScreen(
                        button.dataset.back
                    );

                }
            );

        }
    );


// Close category dropdown
// when clicking outside

document.addEventListener(
    "click",
    event => {

        const dropdown =
            document.getElementById(
                "categoryDropdown"
            );


        const selector =
            document.getElementById(
                "categorySelector"
            );


        if (
            !dropdown ||
            !selector
        ) {
            return;
        }


        if (
            !dropdown.contains(
                event.target
            ) &&
            !selector.contains(
                event.target
            )
        ) {

            dropdown.classList.add(
                "hidden"
            );
        }
    }
);


// ==========================================
// START APP
// ==========================================

getMonthData(
    getCurrentMonth()
);

setDefaultExpenseDate();

updateHomeMoney();

console.log(
    "Spending Tracker loaded successfully."
);