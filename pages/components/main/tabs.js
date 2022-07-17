import {
  Card,
  Tabs,
  Frame,
  Loading,
  TextField
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import ProductsTableSection from "../sections/products-table/products-table-section";

export default function Main({restFetch}){
  const [mainLoaderOn, toggleMainLoader] = useState(() =>true);

  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermFinal, setSearchTermFinal] = useState('')
  const handleChange = useCallback((newValue) => setSearchTerm(newValue), []);

  useEffect(() => {
    const timer = setTimeout(async() => {
      console.log("from useeffect...", searchTerm)
      setSearchTermFinal(searchTerm)
      //useSWR(getProductQueryString(pageInfo.nextCursor, searchTerm), restFetchWrapper(restFetch));
    }, 1000)

    return () => clearTimeout(timer)

  }, [searchTerm])

  return <>
    <Frame>
      {mainLoaderOn && <Loading/>}
        <Card.Section>
            <Card.Section>
              <TextField
                label="Search products..."
                value={searchTerm}
                onChange={(val) => {
                  handleChange(val)
                }}
                autoComplete="off"
              />
            </Card.Section>
          { React.cloneElement(<ProductsTableSection/>, { mainLoaderOn: mainLoaderOn, toggleMainLoader: toggleMainLoader, restFetch: restFetch, search: searchTermFinal }) }
        </Card.Section>
    </Frame>
  </>;
}
