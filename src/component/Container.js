import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ImgList from './ImgList'
import { ethers, Contract } from "ethers";
import { useEffect, useState } from "react";
import artifact from "../abi/nft.json";
import axios from 'axios'

export default function SimpleContainer() {
    // NFT所有者情報
    // NFTのtokenId -> meta data -> image url
    const [nftSalePageInfo, setNftSalePageInfo]  = useState({
        tokenId: '',
        owner: '',
        imageUri:'',
      });
    const [posts, setPosts] = useState([])
    // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
    const contractAddress = "0x04c89607413713ec9775e14b954286519d836fef";
    // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
    // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
    const signer = provider.getSigner();
    const nftContract = contract.connect(signer);

    useEffect(() => {
        const fetchData = async() => {
            //owner of の呼出し
            // 配列にする
            const owner = await nftContract.ownerOf(3)
            const tokenId = 3
            const metaDataUri = await nftContract.tokenURI(3)
            const metaData = await axios.get(metaDataUri)
              .then(res => {
                  // const str = res.data.replace('https://ipfs.io/ipfs/', '')
                  // const json = JSON.parse(str)
                  return res.data
              })
              .catch(e => {
                console.log(e)
              })
              // console.log('-----------------------------')
              // console.log(metaData)
              // console.log('-----------------------------')
            setNftSalePageInfo({tokenId: tokenId, owner: owner, imageUri: metaData.image})
        };
        fetchData().catch((e) => console.log(e));
    }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <ImgList
          { ...nftSalePageInfo }
        />
      </Container>
    </React.Fragment>
  );
}
