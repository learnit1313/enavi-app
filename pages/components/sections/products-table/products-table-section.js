import {
  Page,
  Card,
  Stack,
  Pagination,
  TextField,
} from "@shopify/polaris";
import useSWR, { mutate } from "swr";

import {restFetchWrapper} from "../../../../react-utils/request-handler";
import { useState, useEffect, useCallback } from "react";
import ProductsTable from "./components/products-table";


const appBaseUrl = HOST;

var nestedProperty = require("nested-property");


function getProductQueryString(cursor, search){
  return `${appBaseUrl}/get-products?${(cursor && `cursor=${cursor}&`) || ''}search=${search}`;
}


function ProductsTableSection({restFetch, toggleMainLoader, search}) {

  const [pageCursor, setCurrentPageCursor] = useState(function () {
    return "";
  });


  const [pageInfo, setPageInfo] = useState(function () {
    return { hasNextPage: true, hasPreviousPage: false, nextCursor: "" };
  });
  const [prevCursors, setPrevPageCursor] = useState(function () {
    return [];
  });
  

  // useEffect(() => {
  //   const timer = setTimeout(async() => {
  //     console.log("from useeffect...", searchTerm)
  //     await searchProduct()
  //     //useSWR(getProductQueryString(pageInfo.nextCursor, searchTerm), restFetchWrapper(restFetch));
  //   }, 1000)

  //   return () => clearTimeout(timer)

  // }, [searchTerm])

  // async function searchProduct() {
  //   await mutate(getProductQueryString(pageCursor,searchTerm))
  // }

  const { data, error} = useSWR(
    getProductQueryString(pageCursor, search), restFetchWrapper(restFetch)
  );

  //Prefetch the next page.
  useSWR(getProductQueryString(pageInfo.nextCursor, search), restFetchWrapper(restFetch));


  useEffect(() => {
    toggleMainLoader(() => true);
  }, []);

  useEffect(() => {

    if (data) {
      setPageInfo((pageInfo) => {
        return {
          ...pageInfo,
          ...(nestedProperty.get(data,`products.0.pageInfo`) || {}),
          nextCursor:
          nestedProperty.get(data,`products.0.cursor`),
        };
      });
      toggleMainLoader(() => false);
    }else{
      console.log(error);
    }
  }, [data, error]);

  function handleNextPageClick() {
    setPrevPageCursor(function (prevCursors) {
      return [...prevCursors, pageCursor];
    });
    setCurrentPageCursor(function () {
      return pageInfo.nextCursor;
    });
  }

  function handleLastPageClick() {
    setPrevPageCursor(function () {
      return prevCursors.slice(0, -1);
    });
    setCurrentPageCursor(function () {
      return prevCursors[prevCursors.length - 1];
    });
  }

  async function clearFetchedData(){
    toggleMainLoader(() => true);
    setTimeout(() => toggleMainLoader(() => false), 2000);
    await mutate(getProductQueryString(pageCursor, search));
  }

  var typingTimer;
  return (
    <>
    <Page title="Products" fullWidth>
      {
      <>
        <Card>
            <>
              <Card.Section>
              <ProductsTable
                data={data}
                clearFetchedData={clearFetchedData}
                restFetch={restFetch}
                />
              </Card.Section>
              <Stack distribution="center">
                <div className="p-8">
                  <Pagination
                    hasPrevious={pageInfo.hasPreviousPage}
                    onPrevious={handleLastPageClick}
                    hasNext={pageInfo.hasNextPage}
                    onNext={handleNextPageClick}
                  />
                </div>
              </Stack>
            </>
        </Card>
      </>
      }
    </Page>
  </>
  );
}

export default ProductsTableSection;
