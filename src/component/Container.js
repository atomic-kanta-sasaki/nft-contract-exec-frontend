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
  const [nftSalePageInfo, setNftSalePageInfo]  = useState([]);
  // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
  // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
  const provider = new ethers.providers.JsonRpcProvider();
  const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
  const signer = provider.getSigner();
  const nftContract = contract.connect(signer);
  const tokenIdList = [1,2,3,4,5,6,7]

  const info = []
  useEffect(() => {
      const fetchData = async() => {
          //owner of の呼出し
          // 配列にする
          tokenIdList.map(async(id) => {
            const owner = await nftContract.ownerOf(id)
            const tokenId = id
            const metaDataUri = await nftContract.tokenURI(id)
            const metaData = await axios.get(metaDataUri)
              .then(res => {
                  return res.data
              })
              .catch(e => {
                console.log(e)
              })
            info.push({id:tokenId, owner:owner, tokenId:tokenId, imageUri: metaData.image})
          })
          console.log(info)
          setNftSalePageInfo((prevState) => ([ ...prevState, info ]));

      };
      fetchData().catch((e) => console.log(e));
  }, []);
  console.log("nftSalePageInfo[0]")
  console.log(nftSalePageInfo[0])
  console.log("nftSalePageInfo[0]")


  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <MarginTop />
        <ImgList
          { ...nftSalePageInfo }
          title="販売NFT一覧"
        />
      </Container>
    </React.Fragment>
  );

}
