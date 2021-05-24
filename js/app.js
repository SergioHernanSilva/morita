//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//carrito
let cart = [];
//botones
let buttonsDOM = [];

//Productos (desde JSON)
class Products {
    async getProducts(){
    try {
        let result = await fetch('products.json')
        let data = await result.json();

        let products = data.items;
        products = products.map(item => {
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id,image}
    })
    return products
    } catch (error) {
        console.log(error);
        }
    }
}
//Mostrar productos
class UI {
    displayProducts(products){
        let result = '';
        products.forEach(products => {
            result += `
            <!--single products-->
            <article class="product">
               <div class="img-container">
                   <img src=${products.image} alt="producto" class="product-img">
                   <button class="bag-btn" data-id=${products.id}>
                       <i class="fas fa-shopping-cart"></i>
                       añadir al carrito
                   </button>
               </div> 
               <h3>${products.title}</h3>
               <h4>$${products.price}</h4>
            </article>
            <!--end of single products--> 
            `;
            productsDOM.innerHTML = result;
        });
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "añadido";
                button.disabled = true;
            }
            button.addEventListener('click', (event)=> {
                event.target.innerText = "añadido";
                event.target.disabled = true;
                //traer producto desde Productos (JSON)
                let cartItem = {...Storage.getProduct(id), amount: 1 };            
                //agregar productos al carrito
                cart = [...cart, cartItem];
                //salvar carrito en el local storage
                Storage.saveCart(cart);
                //valores carrito
                this.setCartValues(cart);
                //Mostrar items en el carrito
                this.addCartItem(cartItem);
                //mostrar carrito
                this.showCart()
                });            
            });
        }
    setCartValues(cart){
        let tempTotal= 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>quitar</span>
            </div>
            <div>
                <i class="fas fa-plus" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-minus" data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    };
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        //vaciar carrito
        clearCartBtn.addEventListener("click", () => { 
            this.clearCart();
        });
        //Funcionalidad del carrito
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-plus')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-minus')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        });
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length>0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>agregar al carrito`
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//Local Storage
class Storage {
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener("DOMContentLoaded", () =>{
const ui = new UI();
const products = new Products();
//setup app
ui.setupAPP();
//Mostrar todos los productos
products.getProducts().then(products => {

ui.displayProducts(products);
Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    })
});
