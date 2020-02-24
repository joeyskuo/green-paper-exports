
const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');

form.addEventListener('submit', (e) => {

    e.preventDefault();

    if(name.value && cost.value) {

        db.collection('expenses')
            .add({
                name: name.value,
                cost: parseInt(cost.value)
            })
            .then((res) => {
                console.log(res);
                form.reset();
            })

    } else {
        error.textContent = 'Please enter values before submitting';
    }


})