// import React from "react";
import * as React from "react";
import ProductTable from "../components/ProductTable";
import OrderList from "../components/OrderList";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddIcon from "@mui/icons-material/Add";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Stack from "@mui/joy/Stack";

const Products: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      {" "}
      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Breadcrumbs
            size="sm"
            aria-label="breadcrumbs"
            separator={<ChevronRightRoundedIcon className="text-sm" />}
            sx={{ pl: 0 }}
          >
            <Link
              underline="none"
              color="neutral"
              href="#some-link"
              aria-label="Home"
            >
              <HomeRoundedIcon />
            </Link>
            <Link
              underline="hover"
              color="neutral"
              href="#some-link"
              fontSize={12}
              fontWeight={500}
            >
              Dashboard
            </Link>
            <Typography color="primary" fontWeight={500} fontSize={12}>
              Products
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Typography level="h2" component="h1">
            License Request
          </Typography>
          <Button
            color="success"
            startDecorator={<AddIcon />}
            size="sm"
            onClick={() => setOpen(true)}
          >
            Add Product
          </Button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog>
              <DialogTitle>Add Product</DialogTitle>
              <DialogContent>
                Fill in the information of the product.
              </DialogContent>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setOpen(false);
                }}
              >
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input autoFocus required />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input required />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    {/* <Input required /> */}
                    <Stack spacing={2} alignItems="flex-start">
                      <Select
                        placeholder="Select a category"
                        name="foo"
                        required
                        sx={{ minWidth: 300 }}
                      >
                        <Option value="dog">Electronics</Option>
                        <Option value="cat">Furniture</Option>
                        <Option value="fish">Machinery</Option>
                        <Option value="bird">Tickets</Option>
                      </Select>
                    </Stack>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Number in stock</FormLabel>
                    <Input required />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Product Code</FormLabel>
                    <Input required />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Images</FormLabel>
                    <Input required />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Price</FormLabel>
                    <Input required />
                  </FormControl>

                  <Button type="submit">Add</Button>
                </Stack>
              </form>
            </ModalDialog>
          </Modal>
        </Box>
        <ProductTable />
        {/* <OrderList /> */}
      </Box>
    </div>
  );
};

export default Products;
