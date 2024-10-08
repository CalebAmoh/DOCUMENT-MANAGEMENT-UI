import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";

// Define the Product type
interface Product {
  id: string;
  name: string;
  price: number;
}

// Define the props for ProductCard
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">{product.name}</Typography>
      <Typography color="textSecondary">{product.price}</Typography>
    </CardContent>
  </Card>
);

export default ProductCard;
