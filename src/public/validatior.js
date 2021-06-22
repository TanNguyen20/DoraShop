function Validator(formSelector){
    var _this = this;
    var formRules={};
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    
    /*
        Quy uoc rules:
            +co loi return thong bao loi
            +Khong loi return undefined
    */
    var validatorRules = {
        required: function(value){
            return value? undefined:"Vui lòng nhập trường này";
        },
        min:function(min){
            return function(value){
                return value.length>=min? undefined:`Vui lòng nhập ít nhất ${min} kí tự`;
            }
        },
        max:function(max){
            return function(value){
                return value.length<=max? undefined:`Vui lòng nhập tối đa ${max} kí tự`;
            }
        },
        equal:function(value){
            var password = $("#password").val();
            var repassword = $("#repassword").val();
            if(password>repassword) return "Nhập lại mật khẩu không khớp";
            if(password<repassword) return "Nhập lại mật khẩu không khớp";
            return undefined;
        },
    }
    //lay ra form 
    var formElement = document.querySelector(formSelector);
    //chi xu li neu co id form nay
    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs){
            var passwordinput , repasswordinput ;
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules){

                var ruleArray;
                var isRuleHasValue = rule.includes(':');
                if(isRuleHasValue){
                    ruleArray = rule.split(':');
                    rule=ruleArray[0];
                }
                var ruleFunction = validatorRules[rule];
                if(isRuleHasValue){
                    ruleFunction = ruleFunction(ruleArray[1]);
                }
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunction);
                }
                else{
                    formRules[input.name]=[ruleFunction];
                }
            }
            //listening event de validate(blur,change)
            // input.onkeyup = handleValidate;
            // input.onblur = handleValidate;
            input.onchange = handleValidate;
            input.oninput = handleClearErrMess;
            //
        }
        //Ham thuc hien validate
        function handleValidate(event){
            var rules = formRules[event.target.name];
            var errMess="";
            for(var rule of rules){
                errMess = rule(event.target.value);
                if(errMess) break;
            }
            
            // Neu co loi thi hien thong bao
            if(errMess){
                var formGroup = getParent(event.target, '.auth-form__group');
                if(formGroup){
                    formGroup.classList.add('invalid');
                    var formMess = formGroup.querySelector('.form-message');
                    if(formMess){
                        formMess.innerText = errMess;
                    }
                }
            }
            return !errMess;
        }
        //xoa bo thong bao loi khi nhap dung
        function handleClearErrMess(event){
            var formGroup = getParent(event.target, '.auth-form__group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');

                var formMess = formGroup.querySelector('.form-message');
                if(formMess){
                    formMess.innerText = '';
                }
            }
        }
    }
    //xu li submit form
    formElement.onsubmit = function(event){
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for(var input of inputs){
            if(!handleValidate({ target: input })){
                isValid = false;
            }
        }
        // Khi khong co loi thi submit form
        if(isValid){
            if(typeof _this.onSubmit === 'function'){
                var enableInputs = formElement.querySelectorAll('[name]');
                var formValues = Array.from(enableInputs).reduce(function(values,input){
                    switch(input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="'+input.name+'"]');
                            break;
                        case 'checkbox':
                            if(!input.matches(':checked')){
                                values[input.name] = '';
                                return values;
                            }
                            if(!Array.isArray(values[input.name])){
                                values[input.name] = [];

                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                },{});

                _this.onSubmit(formValues);
            }
            else{
                formElement.submit();
            }
        }
    }
}