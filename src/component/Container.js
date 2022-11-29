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
  // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
  const contractAddress = "0xfbc22278a96299d91d41c453234d97b4f5eb9b2d";
  // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
  // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
  const provider = new ethers.providers.JsonRpcProvider();
  // const provider = new ethers.providers.AlchemyProvider(
  //   "goerli",
  //   process.env.ALCHEMY_API_KEY
  // );
  // const userWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
  // const contract = new ethers.Contract(contractAddress, artifact.abi, userWallet);

  const signer = provider.getSigner();
  const nftContract = contract.connect(signer);

  const info = []
  // NFT所有者情報
  // NFTのtokenId -> meta data -> image url
  const tokenIdList = []
  const [nftSalePageInfo, setNftSalePageInfo]  = useState();
  useEffect(() => {
    console.log('useeffect run')
    const fetchData = async() => {
      const nftNum = await nftContract.getNftNum()
      for (let step = 0; step < nftNum; step++) {
        tokenIdList.push(step)
      }
      console.log(tokenIdList)
      // owner of の呼出し
      // 配列にする
      const info = await Promise.all(
        tokenIdList.map(async(id) => {
          const owner = await nftContract.ownerOf(id)
          const tokenId = id
          const metaDataUri = await nftContract.tokenURI(id)
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
