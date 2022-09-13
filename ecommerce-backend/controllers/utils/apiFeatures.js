class ApiFeatures{
    constructor(query,querystr){
    this.query=query;
    this.querystr=querystr;
    }


    search(){
        const keyword =this.querystr.keyword
        ?{
            name:{
                $regex:this.querystr.keyword,
                $options:"i",
            },
        }:{};

        //console.log(keyword)
        this.query=this.query.find({...keyword});
        return this;

    }


    filter(){
            const queryCopy = {...this.querystr}
            //console.log(queryCopy)
            //remove some feilds from category
            const removeFeilds =["category","page","limit"]

            removeFeilds.forEach(key=>delete queryCopy[key])
            //console.log(queryCopy )

            //filter for price and rating
            var querystr= JSON.stringify(queryCopy)
            querystr=querystr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`);
            //console.log(querystr)

            this.query=this.query.find(JSON.parse(querystr))
            return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.querystr.page)|| 1;

        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this;
    
    }
}

module.exports =ApiFeatures 