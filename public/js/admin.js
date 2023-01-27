//js for client-side for DOM manipulation


const deleteItem = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=id]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('article');
    fetch(`/admin/product/${prodId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result => result.json())
        .then(data => {
            console.log(data.message);
            productElement.parentNode.removeChild(productElement);
        })
        .catch(err => console.log(err))
}