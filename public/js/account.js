$(".pageAccount .register input").keyup(e => {
    if (e.key == "Enter") {
        let name = $(".pageAccount .register input")[0].value;
        let email = $(".pageAccount .register input")[1].value;
        let password = $(".pageAccount .register input")[2].value;

        firebase.auth().createUserWithEmailAndPassword(email, password).then(user => {
            // a conta foi criada aqui
            let usr = user.user;

            usr.updateProfile({
                displayName: name
            }).then(function() {
                // atualizado com sucesso

                alert('usuário criado');
            }).catch(function(error) {
                // ocorreu um erro

                usr.delete().then(function() {
                    // usuário deletado

                    alert('não é possível ter esse nome de exibição');
                }).catch(function(error) {
                    // ocorreu um erro
                });
            });
        }).catch(function(error) {
            // auxilia os erros aqui

            var errorCode = error.code;
            var errorMessage = error.message;

            alert(errorMessage);
        });
    }
})

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // usuário está logado
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        console.log('usuário logado');

        // ...
    } else {
        // usuário deslogado
        //
        // ...
    }
});