$( document ).ready(function() {
    const products = $('.cart-add');
    const cart = $('.cart');
    let cartCount = 0;
    
    products.each((index, product) => {
        $(product).on('click', function(event){
            let card = event.currentTarget;
            card = $(card).closest('.shopping-col');
            event.preventDefault();
            const cartMenu = `
                <li class="product-item" data-info="${index}">
                    ${$(card).find('.product-pic').get(0).outerHTML}
                    ${$(card).find('.product-title').get(0).outerHTML}
                    ${$(card).find('.product-price').get(0).outerHTML}
                </li>
            `;
            
            $('.product-item').each( (i, li) => {
                if(index == $(li).data('info')){
                    console.log($(li).remove());
                    cartCount = $('.product-item').length;
                }
            });
               
            cart.append(cartMenu);
            cartCount++;
            $('.menu-cart').text(cartCount);
            
        });
    });

});