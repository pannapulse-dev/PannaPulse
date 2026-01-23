const savedShopData = localStorage.getItem('shopData');
const shopData = (savedShopData && savedShopData !== "undefined") ? JSON.parse(savedShopData) : null;


const Port = 'https://pannapulsebackend.onrender.com'

// Click Account

let clkAcc = document.querySelector(".account");
clkAcc.addEventListener("click",()=>{
    document.querySelector(".clkAcc").style.display = "grid"
});

// Close Account

let clsAcc = document.querySelector("#clsAcc");
clsAcc.addEventListener("click",()=>{
    document.querySelector(".clkAcc").style.display = "none"
});

// Change Services

document.querySelector('#groceries').addEventListener('click', ()=>{
    document.querySelector('#foodAndSnacksCatalogue').style.display = 'none'
    document.querySelector('#groceriesCatalogue').style.display = 'flex'
});

document.querySelector('#orderFood').addEventListener('click', ()=>{
    document.querySelector('#foodAndSnacksCatalogue').style.display = 'flex'
    document.querySelector('#groceriesCatalogue').style.display = 'none'
});

// Add address

document.getElementById('addAddress').addEventListener('click', ()=>{
    if(localStorage.getItem('userToken')){
        document.querySelector('#container_Address_Body').style.display = 'flex'
    }
})
document.getElementById('cls_Address_Container').addEventListener('click', ()=>{
    document.querySelector('#container_Address_Body').style.display = 'none'
});

// Save Address Logic

const addressForm = document.querySelector('#address_Form');

addressForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addressValue = document.querySelector('#userAddressInput').value;
    const token = localStorage.getItem('userToken');

    if (!token) {
        alert("Please login first to save address.");
        document.querySelector('#container_Address_Body').style.display = 'none';
        document.querySelector('#LoginPage_Body').style.display = 'flex';
        return;
    }

    if (!addressValue) {
        alert("Please enter an address.");
        return;
    }

    try {
        const response = await fetch(`${Port}/add-address`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: addressValue,
                token: token
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            let savedUserData = JSON.parse(localStorage.getItem('userData'));
            savedUserData.address = result.user.address;
            localStorage.setItem('userData', JSON.stringify(savedUserData));

            document.querySelector('#container_Address_Body').style.display = 'none';
            document.querySelector('#userAddressInput').value = '';
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert('Failed to connect to server.');
    }
});

// open login sign up webpage

const openLoginPage = document.querySelector('#openLoginMenu');
openLoginPage.onclick = ()=>{
    document.querySelector('#LoginPage_Body').style.display = 'flex'
}

// close login sign up webpage

const clsLoginPage = document.querySelector('#clsLoginPage');
clsLoginPage.onclick = ()=>{
    document.querySelector('#LoginPage_Body').style.display = 'none'   
}

// Change profile open menu

let clkProfile = document.querySelector("#clkprofile");
clkProfile.addEventListener("click", ()=>{
    if(localStorage.getItem('userData')){
        document.querySelector(".upldPicContainer").style.display = "flex"
    }
});

// Change profile close menu

let clsProfile = document.querySelector("#clsPicMenu");
clsProfile.addEventListener("click", ()=>{
    document.querySelector(".upldPicContainer").style.display = "none"  
});

// username and mobile display

const userNameProfile = document.querySelector('#name');
const userMobileNo = document.querySelector('#mobileNo');

// Shop Login || Register

const loginShop = document.querySelector('#loginShop');
loginShop.onclick = ()=>{
    document.querySelector('#formShop').style.display = 'none'
    document.querySelector('#LoginShopBox').style.display = 'flex'
}
const registerShop = document.querySelector('#registerShop');
registerShop.onclick = ()=>{
    document.querySelector('#formShop').style.display = 'flex'
    document.querySelector('#LoginShopBox').style.display = 'none'
}

// Login || Sign-up

const selSignupBtn = document.querySelector('#Signup_Select');
const selLoginBtn = document.querySelector('#Login_Select');

selSignupBtn.addEventListener('click', ()=>{
    document.querySelector('#Login_form').style.transform = 'translateX(100%)'
    document.querySelector('#Login_form').style.display = 'none'
    document.querySelector('#Signup_form').style.transform = 'translateX(0%)'
    document.querySelector('#Signup_form').style.display = 'flex'
});
selLoginBtn.addEventListener('click', ()=>{
    document.querySelector('#Login_form').style.transform = 'translateX(0%)'
    document.querySelector('#Login_form').style.display = 'flex'
    document.querySelector('#Signup_form').style.transform = 'translateX(-100%)'
    document.querySelector('#Signup_form').style.display = 'none'
});

// Signup Authentication

const signupBtn = document.querySelector('#Signup_user');
signupBtn.onclick= async (e)=>{
    e.preventDefault();
    const userData = {
        firstname: document.querySelector('#First_Name').value,
        lastname: document.querySelector('#Last_Name').value,
        mobile: Number(document.querySelector('#Mobile_No').value),
        email: document.querySelector('#Signup_Email').value,
        otp : Number(document.querySelector('#Signup_Otp').value)
    }
    try{
        const loginResponse = await fetch(`${Port}/auth/signup`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
        const result = await loginResponse.json();
        if(loginResponse.ok){
            alert(result.message);
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userData', JSON.stringify(userData)); 
    
            updateUI(userData);
            document.querySelector('#LoginPage_Body').style.display = 'none'
            userNameProfile.innerText = document.querySelector('#First_Name').value + document.querySelector('#Last_Name').value;
            userMobileNo.innerText = Number(document.querySelector('#Mobile_No').value); 

        }else{
            console.log('Full server response');
            alert(result.error)
        }
    }catch(err){
        alert('Could not connect to server');
    }
};
async function requestOtp(emailvalue) {
    if(!emailvalue){
        alert('Please enter email first');
        return;
    }
    try{
        const respone = await fetch(`${Port}/auth/send-signup-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: emailvalue})
        });
        const result = await respone.json();
        alert(result.message);
    }catch(err){
        console.error('Connection error', err)
    }
};

const signupOtp = document.querySelector('.Send_signup_otp');
signupOtp.onclick = ()=>{
    const email = document.querySelector('#Signup_Email').value;
    requestOtp(email);
};

// Login Authentication

const loginBtn = document.querySelector('#Login_user');
loginBtn.onclick = async (e)=>{
    e.preventDefault();
    const loginData ={
        email: document.querySelector('#Login_Email').value,
        otp: Number(document.querySelector('#Login_Otp').value)
    };
    try{
        const response = await fetch(`${Port}/auth/userlogin`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginData)
        });
        const result = await response.json();
        if(response.ok){
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userData', JSON.stringify(result.user));
            updateUI(result.user);
            alert(result.message);
            document.querySelector('#LoginPage_Body').style.display = 'none';

            setTimeout(location.reload(),1000);
        }else{
            alert(result.error)
        }
    }catch(err){
        console.error("Connection Error:", err);
        alert('Could not connect');
    }
};

async function requestLoginOtp(emailvalue) {
    if(!emailvalue){
        alert('Please enter email first');
        return;
    }
    try{
        const response = await fetch(`${Port}/auth/send-login-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: emailvalue})
        });
        const result = await response.json();
        alert(result.message);
    }catch(err){
        console.error('Connection error', err)
    }
};

const loginOtp = document.querySelector('.Send_Login_otp');
loginOtp.onclick = ()=>{
    const email = document.querySelector('#Login_Email').value;
    requestLoginOtp(email);
};

// Check logged in or not

function checkLoginStatus() {
    const savedUser = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');

    if (savedUser && token) {
        const user = JSON.parse(savedUser);
        updateUI(user);

        // Add shop menu open

        function shopSystem(){
            const addShop = document.querySelector('#addShop');
            addShop.onclick = ()=>{
            document.querySelector('#seller_body').style.display = 'flex'
            };

            // Add shop menu close

            const clsAddShop = document.querySelector('#cls_add_shop_page');
            clsAddShop.onclick = ()=>{
                document.querySelector('#seller_body').style.display = 'none'
            };
        };
        shopSystem();
    }else{

        // Error Box

        const optionsMenuButtons = document.querySelectorAll('.options_menu_button');
        optionsMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('#error_Body').style.display = 'flex';
            });
        });

        // cls error box

        const clsError = document.querySelector('#clsError');
        if (clsError) {
            clsError.onclick = () => {
                document.querySelector('#error_Body').style.display = 'none';
            };
        }
    }
};
function updateUI(user) {
    document.querySelector('#name').innerText = `${user.firstname} ${user.lastname}`;
    document.querySelector('#mobileNo').innerText = user.mobile;
    
    const loginBtn = document.querySelector('#openLoginMenu');
    loginBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
    
    if(user.profile) {
        document.querySelector('#Nav_profile').src = user.profile;
        document.querySelector('#menu_profile').src = user.profile;
    }
}
checkLoginStatus();

// Login to logout button

document.querySelector('#openLoginMenu').addEventListener('click', () => {
    if (localStorage.getItem('userToken')) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        location.reload(); 
    } else {
        document.querySelector('#LoginPage_Body').style.display = 'flex';
    }
    if(localStorage.getItem('shopToken')){
        localStorage.removeItem('shopToken');
        localStorage.removeItem('shopData');
        location.reload();
        alert('Shop closed successfully');
    }
});

// Add shop confirm

const cnfrShop = document.querySelector('#cnfr_Add_Shop');
cnfrShop.onclick = async (e)=>{
    e.preventDefault();

    const passValue = document.querySelector('#Add_shop_password').value

    const shopData = {
        Shopname: document.querySelector('#shop_Name').value,
        WAno: Number(document.querySelector('#WA_Number').value),
        Shopaddress: document.querySelector('#shop_Address').value,
        type: document.querySelector('#shopType').value,
        Password: passValue
    };
    
    if(passValue == '@Sitaram'){
    
        try{
            const response = await fetch(`${Port}/auth/shop`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(shopData)
            })
            const result = await response.json();
            if(response.ok){
                localStorage.setItem('shopToken', result.token);
                localStorage.setItem('shopData', JSON.stringify(result.shop));
                alert(result.message);
                updateShopUI();
                document.querySelector('#seller_body').style.display = 'none'
                
            }else{
                alert(result.error)
            }
        }catch(err){
            alert('Could not connect to server')
        }
    }else{
        alert('Wrong Password, contact with admin for the correct one!')
    }
}

// login to shop

const loginShopBtn = document.querySelector('#login_Shop_Cnfr');

loginShopBtn.onclick = async (e) => {
    e.preventDefault();
    const passValue = document.querySelector('#Login_Shop_Password').value;

    const loginShopData = {
        WAno: Number(document.querySelector('#Login_Shop_Number').value),
        Password: passValue
    };

    if (!loginShopData.WAno || !passValue) {
        alert("Please enter both your WhatsApp number and password.");
        return;
    }
    if(passValue == '@Sitaram'){
        try {
            const loginShopResponse = await fetch(`${Port}/auth/shoplogin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginShopData)
            });

            const result = await loginShopResponse.json();

            if (loginShopResponse.ok) {
                localStorage.setItem('shopToken', result.token);
                localStorage.setItem('shopData', JSON.stringify(result.shop));
                
                alert(result.message);
                
                updateShopUI();
                document.querySelector('#seller_body').style.display = 'none';
                
            } else {
                alert(result.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert('Connection Failed: Could not reach the server.');
        }
    }else{
        alert('Wrong password, please contact admin for right one')
    }
};

// Check Shop

const savedShop = localStorage.getItem('shopData');
if (savedShop) {
    updateShopUI(JSON.parse(savedShop));
}

// Update UI After shop add

function updateShopUI() {
    const addShopBtn = document.querySelector('#addShop');
    if (addShopBtn) {
        addShopBtn.remove();
    }
    const shopDashboardBtn = document.createElement('button')
    shopDashboardBtn.className = 'options_menu_button'
    shopDashboardBtn.id = 'shopDashboard'
    shopDashboardBtn.innerHTML = `<i class="fa-solid fa-chart-line"></i>&nbsp; Dashboard`
    shopDashboardBtn.style.display = 'none'

    const removeProduct = document.createElement('button')
    removeProduct.className = 'options_menu_button'
    removeProduct.id = 'allProduct'
    removeProduct.innerHTML = `<i class="fa-solid fa-burger"></i>&nbsp; All products`

    const addProduct = document.createElement('button')
    addProduct.className = 'options_menu_button'
    addProduct.id = 'productAdd'
    addProduct.innerHTML = `<i class="fa-solid fa-circle-plus"></i>&nbsp; Add Product`

    const closeShop = document.createElement('button')
    closeShop.className = 'options_menu_button'
    closeShop.id= 'closeShop'
    closeShop.innerHTML = `<i class="fa-solid fa-store-slash"></i>&nbsp; Close Shop`

    document.querySelector('#myOrders').after(shopDashboardBtn)
    document.querySelector('#myOrders').after(removeProduct)
    document.querySelector('#myOrders').after(addProduct)
    document.querySelector('#allProduct').after(closeShop)

    // Shop option :- All products

    const allProductBtnShop = document.querySelector('#allProduct');
    allProductBtnShop.addEventListener('click', () => {
        document.querySelector('.allProductsBody').style.display = 'block';
        loadOwnerProducts(); 
    });
    document.querySelector('#clsAllProducts').addEventListener('click', ()=>{
        document.querySelector('.allProductsBody').style.display = 'none'
    })

    // Add Product Menu

    document.querySelector('#productAdd').addEventListener('click', ()=>{
        document.querySelector('#addProduct_Body').style.display = 'flex'
    });
    document.querySelector('#cls_add_product_page').addEventListener('click', ()=>{
        document.querySelector('#addProduct_Body').style.display = 'none'
    });

    // dashboard menu

    document.querySelector('#shopDashboard').addEventListener('click', ()=>{
        document.querySelector('#shopDashboard_Body').style.display = 'block'
    });
    document.querySelector('#clsDashboard').addEventListener('click', ()=>{
        document.querySelector('#shopDashboard_Body').style.display = 'none'
    });
 
    // Add product

    document.querySelector('#save_Product').addEventListener('click', (e)=>{
        e.preventDefault();
        handleProductUpload();
    });

    // Close shop

    document.querySelector('#closeShop').addEventListener('click', ()=>{
        if(localStorage.getItem('shopToken')){
            localStorage.removeItem('shopToken');
            localStorage.removeItem('shopData');
            location.reload();
            alert('Shop closed successfully');
        }
    });
}

// add product image preview

const inputProductImage = document.querySelector('#productImage');
const previewImage = document.querySelector('#imagePreview');
const productImageText = document.querySelector('#uploadText');

inputProductImage.addEventListener('change', function(){
    const file = this.files[0];

    if(file){
        const reader = new FileReader();

        reader.onload = (e)=>{
            productImageText.style.display = 'none';
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// Display Profile Image

const profileImage = document.getElementById('ImagePic');

document.getElementById('ChangeProfile').addEventListener('change', function(){
    const file = this.files[0];

    if(file){
        const reader = new FileReader();
        reader.onload = (e)=>{
            profileImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Set profile image

document.getElementById('cnfrProfile').addEventListener('click', (e)=>{
    e.preventDefault();
    updateUserProfile();
})

// add product

async function handleProductUpload() {
    const rawData = localStorage.getItem('shopData');

    let commissionVal = 1.2
    const valPrice = Number(document.querySelector('#ProductPrice').value);
    if(100<=valPrice>30){
        commissionVal = 1.2
        
    }else if(valPrice>100){
        commissionVal = 1.1
    }
    const savedShop = JSON.parse(rawData);

    const newProductName = document.querySelector('#productName').value;
    const newProductPrice = (Number(document.querySelector('#ProductPrice').value) * commissionVal).toFixed(2);
    const newProductQuantity = Number(document.querySelector('#productQuantity').value);
    const newProductQuantityType = document.querySelector('#productQuantityType').value;
    const newProductCategory = document.querySelector('#productType').value;
    const newProductImage = document.querySelector('#productImage').files[0];

    const formData = new FormData();
    formData.append('name', newProductName);
    formData.append('price', newProductPrice);
    formData.append('quantity', newProductQuantity);
    formData.append('quantityType', newProductQuantityType);
    formData.append('category', newProductCategory);
    formData.append('Image', newProductImage);
    formData.append('shopId', savedShop._id);

    try{
        const response = await fetch(`${Port}/add-product`,{
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
        alert("Product Added successfully!"); 
    } else {
        alert("Server Error: " + (result.error || result.details || "Unknown error"));
        console.error("Server details:", result);
    }
    }catch(err){
        alert('Upload fail!');
    }
}

// display products

async function loadProducts(filterShopId) {
    try {
        const response = await fetch(`${Port}/get-products`, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');

        const products = await response.json();
        const container = document.querySelector('#CheckShopProducts_Display');
        container.innerHTML = ''; 

        const filteredProducts = products.filter(p => p.shopId && p.shopId._id === filterShopId);

        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'productCard';
                productCard.setAttribute('data-id', product._id);

                const imageSrc = product.Image ? product.Image : 'default-placeholder.png';
                const Shopname = product.shopId ? product.shopId.Shopname : "PannaPulse";
                
                productCard.innerHTML = `
                    <img src="${imageSrc}" alt="${product.name}">
                    <p class='Shopname'>${Shopname}</p>
                    <p class="shopProduct">${product.name}</p>
                    <p class="price">Rs. ${product.price}</p>
                `;
                container.appendChild(productCard);
            });
        } else {
            container.innerHTML = `<p style="text-align:center; padding:20px;">This shop has no products yet.</p>`;
        }
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

async function loadOwnerProducts() {
    const savedShop = JSON.parse(localStorage.getItem('shopData'));
    const displayContainer = document.querySelector('.allProductsDisplayShop');
    const shopHeader = document.querySelector('#ShopNameheader');

    if (!savedShop || !savedShop._id) {
        alert("Please login to your shop first.");
        return;
    }

    try {
        shopHeader.innerText = savedShop.Shopname;

        const response = await fetch(`${Port}/shop/shopall-products?shopId=${savedShop._id}`);
        const products = await response.json();

        displayContainer.innerHTML = '';

        if (products.length > 0) {
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'ProductDetails';
                card.setAttribute('data-id', `${product._id}`);
                card.innerHTML = `
                    <div id="singleProductDetails">
                <img src="${product.Image}" id="productImgShop">
                <table border="0" cellspacing="5px">
                    <tr>
                        <th>Name :</th>
                        <td>${product.name}</td>
                    </tr>
                    <tr>
                        <th>Quantity :</th>
                        <td>${product.quantity}</td>
                    </tr>
                    <tr>
                        <th>Quantity type :</th>
                        <td>${product.quantityType}</td>
                    </tr>
                    <tr>
                        <th>Price :</th>
                        <td>Rs. ${product.price}</td>
                    </tr>
                </table>
            </div><hr>
            <div id="ProductActions">
                <button type="button" class='ProductActionsClass' id="updateProductDetails">Update</button>
                <button type="button" class='ProductActionsClass' id="deleteProduct">Remove</button>
            </div>
                `;
                displayContainer.prepend(card);
                document.querySelectorAll('#deleteProduct').forEach(btn => {
                    btn.onclick = async (e) => {
                        const card = e.target.closest('.ProductDetails');
                        const productId = card.getAttribute('data-id');
                        await removeShopProduct(productId, card);
                    };
                    document.querySelectorAll('#updateProductDetails').forEach(btn=>{
                        btn.onclick = async(e) =>{
                            const card = e.target.closest('.ProductDetails');
                            document.querySelector('#updateProduct_Body').style.display = 'flex'
                            document.querySelector('#clsUpdateProduct').onclick = ()=>{
                                document.querySelector('#updateProduct_Body').style.display = 'none'
                            }
                            document.querySelector('#UpdateProduct_id').value = card.getAttribute('data-id');
                            document.querySelector('#cnfrUpdateProduct').onclick = async function (b) {
                                b.preventDefault();
                                await updateShopProducts();
                            }
                        }
                    })
                });
            });
        } else {
            displayContainer.innerHTML = '<p style="text-align:center; width:100%; padding:20px;">No products added yet.</p>';
        }
    } catch (err) {
        console.error("Error loading shop products:", err);
    }
};

async function updateUserProfile() {
    const rawData = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');

    if (!rawData || !token) {
        alert("User session expired. Please log in again.");
        return;
    }
    const savedUser = JSON.parse(rawData);
    
    const profilePath = document.querySelector('#ChangeProfile').files[0];
    if (!profilePath) {
        alert("Please select an image first.");
        return;
    }
    const formData = new FormData();
    formData.append('token', localStorage.getItem('userToken'));
    formData.append('profile', profilePath);
    
    try{
        const response = await fetch(`${Port}/add-profile`,{
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if(response.ok){
            alert('Profile saved successfully!')

            let savedUser = JSON.parse(rawData);
            savedUser.profile = result.user.profile; 
            localStorage.setItem('userData', JSON.stringify(savedUser));

            document.querySelector('#Nav_profile').src = result.user.profile;
            document.querySelector('#menu_profile').src = result.user.profile;
            document.querySelector('#ImagePic').src = result.user.profile;

        }else{
            alert("Server Error: " + (result.error || result.details || "Unknown error"));
            console.error("Server details:", result);
        }
    }catch(err){
        alert('Upload fail')
    }
}

// Shop view

async function shopDisplay() {
    try{
        const response = await fetch(`${Port}/get-shops`,{
            method: 'GET',
        });
        if(!response.ok){
            throw new Error('failed to fetch data');
        }

        const shops = await response.json();
        const foodContainer = document.querySelector('#foodAndSnacksCatalogue');
        const groceryContainer = document.querySelector('#groceriesCatalogue');

        foodContainer.innerHTML = '';
        groceryContainer.innerHTML = '';

        if(Array.isArray(shops) && shops.length > 0){
            shops.forEach(shop =>{
                const shopCard = document.createElement('div');
                shopCard.className = 'shopCard'
                shopCard.setAttribute('data-id', shop._id)

                shopCard.innerHTML = `
                <p class="shopCard_Name">${shop.Shopname}</p>
                <p class="shopCard_Type">Type : ${shop.type}</p>
                <p class="shopCard_Address">Address : ${shop.Shopaddress}</p>
                `;
                if(shop.type === 'Food and snacks'){
                    foodContainer.append(shopCard);
                }else if(shop.type === 'Groceries'){
                    groceryContainer.append(shopCard);
                }

                shopCard.addEventListener('click', ()=>{
                    const overlay = document.createElement('div');
                    overlay.id = 'checkShopProducts';

                    overlay.innerHTML = `
                    <header id="CheckShopProducts_Header">
                    <span>${shop.Shopname}</span>
                    <button type="button" class="cls_CheckShopProducts">X</button>
                    </header>
                    <div id="CheckShopProducts_Display">

                    </div>
                    `;
                    document.body.appendChild(overlay);
                    loadProducts(shop._id);
                    document.querySelector('.cls_CheckShopProducts').addEventListener('click', ()=>{
                        overlay.remove();
                    });
                });

            })
        }else{

                foodContainer.innerHTML = `
                <div style="width:100%; text-align:center; padding: 20px; color: grey;">
                    <h3>No shops available yet</h3>
                    <p>Check back later!</p>
                </div>`;
                groceryContainer.innerHTML = `
                <div style="width:100%; text-align:center; padding: 20px; color: grey;">
                    <h3>No items available yet</h3>
                    <p>Check back later!</p>
                </div>`;
        }
    }
    catch(err){
        console.error("Error loading products:", err);
        document.querySelector('#foodAndSnacksCatalogue').innerHTML = 
            '<p style="color:red; text-align:center;">Failed to load food and snacks shops.</p>';
        document.querySelector('#groceriesCatalogue').innerHTML = 
            '<p style="color:red; text-align:center;">Failed to load groceries shops.</p>';
    }
}

shopDisplay();

async function productPreview() {
    document.addEventListener('click', async (e) => {
        const card = e.target.closest('.productCard');
        
        if (card) {
            const productId = card.getAttribute('data-id');
            
            if (!productId) {
                console.error("No data-id found on this card");
                return;
            }

            try {
                const response = await fetch(`${Port}/api/products/${productId}`);
                const data = await response.json();

                const overlay = document.createElement('div');
                overlay.id = 'checkProduct_Body';
                
                overlay.innerHTML = `
                    <div id="checkProduct_Image">
                        <button id="closePreview">X</button>
                        <img src="${data.Image}" alt="${data.name} id="previewProductImage">
                    </div>
                    
                    <div id="checkProduct_info" data-id="${data._id}">
                        <div class="top">
                            <p class="brand">${data.shopId ? data.shopId.Shopname : 'PannaPulse'}</p>
                            <h1 id="previewProductName">${data.name}</h1>
                            <p class="price" id="previewProductPrice">Rs. ${data.price}</p>
                            <p style="color:gray">${data.quantity} ${data.quantityType}</p>
                        </div>

                        <div class="bottom">
                            <div class="quantity-container">
                                <button class="qty-btn" id="decQty">-</button>
                                <input type="number" id="previewProductQuantity" value="1" placeholder="1" min="1" readonly>
                                <button class="qty-btn" id="incQty">+</button>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-order" id="btn-order"><i class="fa-solid fa-box-open"></i>&nbsp; Order Now</button>
                                <button class="btn btn-cart"><i class="fa-solid fa-cart-plus"></i>&nbsp; Add to Cart</button>
                            </div>
                        </div>
                    </div>`;

                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden'; 
                const selectedQuantity = Number(document.getElementById('previewProductQuantity').value) || 1;

                // Close Button Logic
                document.getElementById('closePreview').onclick = () => {
                    overlay.remove();
                    document.body.style.overflow = 'auto';
                };

                // Quantity Logic
                const qtyInput = document.getElementById('previewProductQuantity');
                document.getElementById('incQty').onclick = () => qtyInput.value++;
                document.getElementById('decQty').onclick = () => {
                    if (qtyInput.value > 1) qtyInput.value--;
                };

                // Cart

                document.querySelector('.btn-cart').addEventListener('click', () => {
                    const helloId = document.querySelector('#checkProduct_info');
                    const selectedQuantity = Number(document.getElementById('previewProductQuantity').value) || 1;
                    const product = {
                        _id: helloId.getAttribute('data-id'), 
                        name: document.querySelector('#previewProductName').innerText,
                        price: Number(document.querySelector('#previewProductPrice').innerText.replace('Rs. ', '')),
                        image: data.Image,
                        shopName: data.shopId ? data.shopId.Shopname : "Unknown Shop",
                        shopNumber: data.shopId ? data.shopId.WAno: "not given",
                        shopAdd: data.shopId ? data.shopId.Shopaddress : "Unknown Address"
                    };
                    addToCart(product, selectedQuantity);
                });

                // order

                document.querySelector('#btn-order').addEventListener('click',() => {

                    const userData = JSON.parse(localStorage.getItem('userData'));
                    const token = localStorage.getItem('userToken');

                    if (!token || !userData) {
                        alert("Please login to place an order.");
                        return;
                    }
                    
                    const singlePrice = Number(document.querySelector('#previewProductPrice').innerText.replace('Rs. ', ''));
                    const prQty = Number(document.querySelector('#previewProductQuantity').value);
                    const numericPrice = singlePrice*prQty;
                    if(numericPrice>30){
                        let deliveryFee = 40;

                        document.querySelector('#bill_Body').style.display = 'flex';
                        
                        document.querySelector('#s2').innerHTML = `Rs. ${numericPrice}`;

                        if(numericPrice>150){
                            deliveryFee = 0
                        }
                        else if(100<numericPrice>150){
                            deliveryFee = 20
                        }
                        else if(numericPrice<100){
                            deliveryFee = 50
                        }
                        document.querySelector('#b2').innerText = `Rs. ${deliveryFee} `;

                        document.querySelector('#c2').innerText = `Rs. ${deliveryFee+numericPrice+15}`
                    }else{
                        document.querySelector('#error_Body').style.display = 'flex';
                        document.querySelector('#error_message_p').innerText = 'Total amount must be Rs. 30';
                        document.querySelector('#clsError').addEventListener('click', ()=>{
                            document.querySelector('#error_Body').style.display = 'none'
                        })
                    }
                });

                document.querySelector('#PlaceOrder').addEventListener('click', async (req,res)=>{
                    const qtyInput = document.getElementById('previewProductQuantity');
                    const selectedQuantity = Number(qtyInput.value) || 1;
                    const userData = JSON.parse(localStorage.getItem('userData'));
                    const token = localStorage.getItem('userToken');
                    const finalTotalDisplay = document.querySelector('#c2').innerText;
                    const delFees = document.querySelector('#b2').innerText;

                    if (!token || !userData) {
                        alert("Please login to place an order.");
                        return;
                    }
                    
                    const directOrder = {
                        orderId: "ORD" + Math.floor(Math.random() * 1000000),
                        date: new Date().toLocaleString(),
                        items: [{
                            name: document.querySelector('#previewProductName').innerText,
                            price: Number(document.querySelector('#previewProductPrice').innerText.replace('Rs. ', '')),
                            quantity: selectedQuantity,
                            image: data.Image,
                            shopName: data.shopId ? data.shopId.Shopname : "PannaPulse",
                            shopNumber: data.shopId ? data.shopId.WAno : "",
                            shopAdd: data.shopId ? data.shopId.Shopaddress : ""
                        }],
                        delivery: delFees,
                        total: finalTotalDisplay,
                        status: 'Confirmed'
                    };
    
                    let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
                    orderHistory.push(directOrder);
                    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
                    const orderDetails = {
                        customer: {
                            name: `${userData.firstname} ${userData.lastname}`,
                            mobile: userData.mobile,
                            address: userData.address || "No address provided"
                        },
                        items: directOrder.items,
                        total: `Rs. ${Number(finalTotalDisplay.replace('Rs. ', ''))}`
                    };
    
                    try {
                        const response = await fetch(`${Port}/place-order`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderDetails)
                        });
    
                        if (response.ok) {
                            alert("Order Placed Successfully!");
                            document.getElementById('checkProduct_Body').remove();
                            document.body.style.overflow = 'auto';
                            displayMyOrders(); 
                            document.querySelector('#bill_Body').style.display = 'none'
                        }
                    } catch (err) {
                        alert("Order saved locally, but server notification failed.");
                    }
                })
            } catch (err) {
                console.error("Error fetching product details:", err);
            }
        }
    });
}

productPreview();

async function removeShopProduct(productId, elementToRemove) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`${Port}/shop/remove-product/${productId}`, {
            method: 'DELETE' 
        });
        
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            elementToRemove.remove();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error('Error occurred while deleting product:', err);
        alert('Failed to delete product.');
    }
}

async function updateShopProducts() {
    const newPrice = Number(document.querySelector('#newProductPrice').value)
    const ProductId = document.querySelector('#UpdateProduct_id').value

    if (!confirm("Are you sure you want to update this product"))return ;
        
    try{
        const response = await fetch(`${Port}/shop/update-product/${ProductId}`,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price: newPrice })
        });
        const result = await response.json();
        if(response.ok){
            alert(result.message);   
            // location.reload();
        }else{
            alert(result.error);
        }
    }catch (err) {
        console.error('Error occurred while deleting product:', err);
        alert('Failed to update product.');
    }
};

// Cart menu

document.getElementById('Cart').addEventListener('click', () => {
    if(localStorage.getItem('userData')){
        document.querySelector('#cart_Body').style.display = 'flex';
        displayCart();
    }
});

document.getElementById('clsCart').addEventListener('click', ()=>{
    document.querySelector('#cart_Body').style.display = 'none';
});

function addToCart(product, selectedQuantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        const existingShop = cart[0].shopName;
        if (existingShop !== product.shopName) {
            const confirmChange = confirm(`Your cart contains items from "${existingShop}". Adding this will clear your current cart. Continue?`);
            if (confirmChange) {
                cart = [];
            } else {
                return;
            }
        }
    }
    const existingIndex = cart.findIndex(item => item._id === product._id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += selectedQuantity;
    } else {
        product.quantity = selectedQuantity;
        cart.push(product);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBox = document.querySelector('#cart_Box');
    const totalAmountSpan = document.querySelector('#totalCartAmount_box_amount');
    
    let total = 0;

    if (cart.length === 0) {
        cartBox.innerHTML = '<p style="text-align:center; margin-top:20px;">Your cart is empty.</p>';
        totalAmountSpan.innerText = `Rs. 0`;
        return;
    }

    cartBox.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="display:flex; align-items:center; gap:15px; padding:10px; border-bottom:1px solid #ccc;">
                <img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:5px; border:1px solid #000;">
                
                <div style="flex-grow:1;">
                    <h4 style="margin:0;">${item.name}</h4>
                    <p style="margin:5px 0;">Rs. ${item.price} x ${item.quantity}</p>
                </div>

                <button onclick="removeFromCart('${item._id}')" style="color:red; background:none; cursor:pointer; font-weight:bold;">Remove</button>
            </div>
        `;
    }).join('');

    totalAmountSpan.innerText = `Rs. ${total}`;
}

// Function to Remove Item

window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
};

// Orders function

document.getElementById('orderFromCart').addEventListener('click', async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('userToken');

    if (!token || !userData) {
        alert("Please login to place an order.");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    
    const totalText = document.querySelector('#totalCartAmount_box_amount').innerText;
    const numericPrice = Number(totalText.replace('Rs. ', ''));
        if(numericPrice>30){
        let deliveryFee = 40;

        document.querySelector('#bill_Body').style.display = 'flex';
        
        document.querySelector('#s2').innerHTML = `Rs. ${numericPrice}`;

        if(numericPrice>150){
            deliveryFee = 0
        }
        else if(100<numericPrice>150){
            deliveryFee = 20
        }
        else if(numericPrice<100){
            deliveryFee = 50
        }
        document.querySelector('#b2').innerText = `Rs. ${deliveryFee} `;

        document.querySelector('#c2').innerText = `Rs. ${deliveryFee+numericPrice+15}`
        const delFees = document.querySelector('#a2').innerText;

        document.querySelector('#PlaceOrder').addEventListener('click', async (req, res)=>{

            const finalTotalDisplay = document.querySelector('#c2').innerText;
            const newOrder = {
                orderId: "ORD" + Math.floor(Math.random() * 1000000),
                date: new Date().toLocaleString(),
                items: [...cart],
                delivery: delFees,
                total: finalTotalDisplay,
                status: 'Confirmed'
            };

            let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
            orderHistory.push(newOrder);
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

            const orderDetails = {
                customer: {
                    name: `${userData.firstname} ${userData.lastname}`,
                    mobile: userData.mobile,
                    address: userData.address || "No address provided"
                },
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    shopName: item.shopName || "General Store" ,
                    shopNumber: item.shopNumber,
                    shopAdd: item.shopAdd,
                })),
            total: finalTotalDisplay
            };

    try {
        const response = await fetch(`${Port}/place-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails)
        });

        if (response.ok) {
            alert("Order placed! You will be notified shortly.");
            localStorage.removeItem('cart');
            location.reload();
        }
    } catch (err) {
        alert("Failed to send order notification.");
    }
        })
    }else{
        document.querySelector('#error_Body').style.display = 'flex';
        document.querySelector('#error_message_p').innerText = 'Total amount must be Rs. 30';
    }
});
document.querySelector('#cls_Bill').addEventListener('click',()=>{
    document.querySelector('#bill_Body').style.display = 'none'
});


// --- Orders Section Logic ---

function displayMyOrders() {
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const ordersBox = document.querySelector('#myOrders_Box');

    if (orders.length === 0) {
        ordersBox.innerHTML = `<p style="text-align:center; padding:40px; color:gray;">No orders yet.</p>`;
        return;
    }

    ordersBox.innerHTML = [...orders].reverse().map(order => {
        const itemDetails = (order.items || []).map(item => 
            `<div style="display:flex; justify-content:space-between; font-size:14px;">
                <span>${item.name} (x${item.quantity})</span>
                <span class="itemPQty">Rs. ${item.price * item.quantity}</span>
            </div>`
        ).join('');
        

        return `
            <div class="order-card" style="border: 1px solid #ddd; margin: 15px; border-radius: 8px; background: #fff; padding:15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: gray; border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 5px; display:flex; justify-content:space-between;">
                    <span>ID: ${order.orderId}</span>
                    <span>${order.date}</span>
                </div>
                ${itemDetails}
                <div style="display:flex; justify-content:space-between; font-size:14px;">
                <span style="text-transform: uppercase;">Packaging fees</span>
                <span>Rs. 15</div>
                <div style="display:flex; justify-content:space-between; font-size:14px;">
                <span style="text-transform: uppercase;">Delivery Fee</span>
                <span>${order.delivery}</span></div>
                <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>Total:</span>
                    <span style="color:#2e7d32;">${order.total}</span>
                </div>
            </div>`;
    }).join('');
}

document.getElementById('myOrders').addEventListener('click', () => {
    if (localStorage.getItem('userToken')) {
        document.getElementById('myOrders_Body').style.display = 'block';
        displayMyOrders();
    } else {
        document.querySelector('#error_Body').style.display = 'flex';
    }
});
document.getElementById('cls_MyOrders').addEventListener('click', ()=>{
    document.getElementById('myOrders_Body').style.display = 'none';
});

// Shop dashboard

function loadShopDashboard() {
    const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const currentShopName = shopData ? shopData.Shopname : "";

    if (!currentShopName) {
        alert("Shop data not found. Please login as a seller.");
        return;
    }

    let totalOrdersCount = 0;
    let totalRevenue = 0;
    let productStats = {};

    allOrders.forEach(order => {
        const shopItems = order.items.filter(item => item.shopName === currentShopName);
        
        if (shopItems.length > 0) {
            totalOrdersCount++;
            
            shopItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalRevenue += itemTotal;

                if (!productStats[item.name]) {
                    productStats[item.name] = { qty: 0, revenue: 0 };
                }
                productStats[item.name].qty += item.quantity;
                productStats[item.name].revenue += itemTotal;
            });
        }
    });

    document.getElementById('stat_totalOrders').innerText = totalOrdersCount;
    document.getElementById('stat_totalRevenue').innerText = `Rs. ${totalRevenue}`;

    const productList = document.getElementById('product_sales_list');
    productList.innerHTML = Object.keys(productStats).length > 0 ? 
        Object.keys(productStats).map(pName => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <div>
                    <strong>${pName}</strong><br>
                    <small style="color:gray;">Sold: ${productStats[pName].qty} units</small>
                </div>
                <div style="font-weight:bold; color:#2e7d32;">
                    Rs. ${productStats[pName].revenue}
                </div>
            </div>
        `).join('') : '<p style="padding:10px; color:gray;">No sales recorded yet.</p>';

};


