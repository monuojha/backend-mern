

class ApiError extends Error{
         constructor (
            statusCode,
            massage="something went wrong",
            errors=[],
            stack=""
            
         ){
            super(massage)
            this.statusCode=statusCode
            this.data=null
            this.massage=massage
            this.errors=errors
            this.stack=stack

            if (stack) {
                 this.stack=stack
            } else {
                Error.captureStackTrace(this, this.constructor)
            }

         }
}


export  {ApiError}