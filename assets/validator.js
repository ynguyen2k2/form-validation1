 // Đối tượng ` Validator`
 function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};


    // Hàm thực hiện  validate
     function validate(inputElement, rule) {
        var errorMessage ;
        // Lấy thẻ cha của thẻ input từ hàm getParent
        // var inputParentElement = getParent(inputElement, options.formGroupSelector);
        

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);           

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        

        // Lặp qua từng rule & kiểm tra 
        // Nếu có lỗi thì dừng việc kiểm tra 
        for(var i = 0 ; i < rules.length; i++) {

            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                        errorMessage = rules[i](
                            formElement.querySelector(rule.selector + ':checked')
                        );
                        break;
                default:
                    errorMessage = rules[i](inputElement.value);

            }

            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }
        return !errorMessage
     }
     // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    
    if(formElement) {

        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule ) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid =  validate(inputElement, rule);
                if(!isValid) {
                    isFormValid =false;
                }
            });


            

            if (isFormValid) {
                // Trường hợp submit với javascript
                if( typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                       
                        switch(input.type) {
                            case 'radio':
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value ;
                                    }
                                    break;
                            case 'chekcbox':
                                    if(!input.matches(':checked')) {
                                    values[input.name] = [];
                                    return values;
                                    }
                                    if(!Array.isArray(values[input.name])){
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                    break;
                            
                            case 'file':
                                    values[input.name]
                                    break;
                            default:
                                values[input.name] = input.file ;
                                
                        }
                       
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                 // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }


        // Lặp qua mỗi rule và xử lý (lắng nghe về sự kiện blur, input, ...)
        options.rules.forEach(function (rule ) {

            // Lưu lại các rules cho mỗi input 
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach(function(inputElement) {
                     // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function( ) {
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement, rule)
                    
                }
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            });

            
        })
    }

 }


 // Định nghĩa rules
 // Nguyên tắc của các rules 
 // 1. Khi có lỗi  => Trả ra meesae lỗi 
 // 2. Khi hợp lệ -> Không trả ra cái gì cả (undifined)
 Validator.isRequired = function(selector, message) {
     return {
         selector: selector,
         test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này '
         }
     }
 }
 Validator.isEmail = function(selector,message) {
     return {
         selector: selector,
         test: function (value) {
             // Javascript email regex
             var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
             return regex.test(value) ? undefined : message || 'Trường này phải là email'

         }
     }
}
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            // Javascript email regex
           
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiếu ${min} kí tự`

        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
            
        }
    }
}