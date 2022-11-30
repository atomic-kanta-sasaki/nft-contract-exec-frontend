import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ImgList from './ImgList'
import { ethers, Contract } from "ethers";
import { useEffect, useState } from "react";
import artifact from "../abi/nft.json";
import axios from 'axios'
import style from "styled-components";

const MarginTop = style.div`
  margin-top 5%
`;

export default function SimpleContainer() {
  // NFT所有者情報
  // NFTのtokenId -> meta data -> image url
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.REACT_APP_ALCHEMY_API_KEY
  );
  const userWallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, artifact.abi, userWallet);

  const info = []
  // NFT所有者情報
  // NFTのtokenId -> meta data -> image url
  const tokenIdList = []
  const [nftSalePageInfo, setNftSalePageInfo]  = useState();
  useEffect(() => {
    console.log('useeffect run')
    const fetchData = async() => {
      const nftNum = await contract.getNftNum()
      for (let step = 0; step < nftNum; step++) {
        tokenIdList.push(step)
      }
      console.log(tokenIdList)
      // owner of の呼出し
      // 配列にする
      const info = await Promise.all(
        tokenIdList.map(async(id) => {
          const owner = await contract.ownerOf(id)
          const tokenId = id
          const metaDataUri = await contract.tokenURI(id)
          const metaData =  (await axios.get(metaDataUri)).data
          const result = { id:tokenId, owner:owner, tokenId:tokenId, imageUri: metaData.image }
          return result
        })
      )
      return info.filter(v => v)
    };
    fetchData().then(
        (info) => {
          console.log("info")
          console.log(info)
          setNftSalePageInfo(info)
    }).catch((e) => console.log(e));
  }, []);


  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <MarginTop />
        <ImgList
          data={nftSalePageInfo}
          title="販売NFT一覧"
        />
      </Container>
    </React.Fragment>
  );

}
