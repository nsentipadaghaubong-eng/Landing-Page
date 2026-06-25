import {
useState
}
from "react"

import starterProducts

from "../demo/data/starterProducts"

import ProductCard

from "../demo/components/ProductCard"

import ProductForm

from "../demo/components/ProductForm"

import InventoryStats

from "../demo/components/InventoryStats"

import InventoryHeader

from "../demo/components/InventoryHeader"

function DemoPage(){

const [

products,

setProducts

]

=

useState(

starterProducts

)

function addProduct(
product
){

setProducts([

...products,

{

id:Date.now(),

name:product.name,

price:Number(
product.price
),

stock:Number(
product.stock
)

}

])

}

function sellProduct(id){

setProducts(

products.map(

item=>{

if(
item.id===id
){

return{

...item,

stock:

item.stock>0

?

item.stock-1

:0

}

}

return item

}

)

)

}

function editProduct(

id,
field,
value

){

setProducts(

products.map(

item=>{

if(
item.id===id
){

return{

...item,

[field]:

field==="name"

?

value

:

Number(
value
)

}

}

return item

}

)

)

}

return(

<div
className="upload-page"
>

<InventoryHeader/>

<InventoryStats
products={
products
}
/>

<div
className="upload-box"
>

{

products.map(

product=>

<ProductCard

key={
product.id
}

product={
product
}

sellProduct={
sellProduct
}

editProduct={
editProduct
}

/>

)

}

</div>

<ProductForm
addProduct={
addProduct
}
/>

</div>

)

}

export default DemoPage