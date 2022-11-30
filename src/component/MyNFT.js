import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ImgList from './ImgList'
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import artifact from "../abi/nft.json";
import axios, { AxiosError } from 'axios'
import style from "styled-components";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Loading from './Loading';

const FormData = require("form-data");
const MarginTop = style.div`
  margin-top 5%
`;
export default function SimpleContainer() {
  const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiOTkwMTFiNC1lNzIyLTQ1NGMtOWEwNC0yOWE3OWU2ZjZjMzIiLCJlbWFpbCI6ImthLXNhc2FraUBzaW9zLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxYzA3ZGE4ZDA5OGJmY2VlNWFmMyIsInNjb3BlZEtleVNlY3JldCI6ImU0MmZiYTE3OWQxNWZiZGFiMTQ3ZmUxOWJmMGVkMGI5N2QzN2FmNWJlNjE1NWVjZGYzM2Q2MjRkNjgyN2IwM2YiLCJpYXQiOjE2NjkwMjQwMjN9.8eC7ByPhkihGcR29rZeplrpaVDaZ_Nlpuae9nVAmkFY"
  const contractAddress = "0xb9158787513bC53B36013E5B3b46a9e224E63273";
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    "6yExW-4TAFr8RdK6RkIyB1LgQMoyTlbo"
  );
  const userWallet = new ethers.Wallet("c10ae66af8072c6467dea49312e2ba05ea28b521c3a9e8f041e203345fc80ebe", provider);
  const nftContract = new ethers.Contract(contractAddress, artifact.abi, userWallet);
  const getAccount = async () => {
    try {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(account)
        if (account.length > 0) {
            return account[0];
        } else {
            return "";
        }
    } catch (err) {
        if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log('Please connect to MetaMask.');
        } else {
            console.error(err);
        }
        return "";
    }
  }

  const [file, setFile] = useState(null)
  const [ isLoading, setIsLoading ] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const onChangeFile = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const onClickSubmit = async () => {
    if (!file) {
      return
    }
    setIsLoading(true);
    const formData = new FormData()
    formData.append("file", file)

    var config0 = {
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
      data : formData
    };

    const res0 = await axios(config0)
    console.log(res0.data.IpfsHash);

    var json = JSON.stringify({
      "name": "NFT",
      "description": "NFT",
      "image": `https://ipfs.io/ipfs/${res0.data.IpfsHash}`,
      "attributes": [
          {
              "value":10
          }
      ]
    });
    var config1 = {
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      data : json
    };


    const res1 = await axios(config1);
    console.log(res1.data);

    // safeMintはonlyOwnerなのでこのアドレスしかMintすることができない
    // onlyOwnerではなくても行けるのかは別途調査が必要
    if (res1.data.isDuplicate != true) {
      nftContract.incrementNftNum()
    };
    const sleep = (second) => new Promise(resolve => setTimeout(resolve, second * 5000))
    console.log('start')
    console.log(`${new Date().getSeconds()} 秒`)
    await sleep(1)
    console.log(`${new Date().getSeconds()} 秒`)
    console.log('end')
    nftContract.safeMint("0x145242286AE8184cA885E6B134E1A1bA73858BE8", res1.data.IpfsHash)
    setIsLoading(false);
    setOpen(true);
  }

  // NFT所有者情報
  // NFTのtokenId -> meta data -> image url
  const tokenIdList = []
  const [nftSalePageInfo, setNftSalePageInfo]  = useState();
  useEffect(() => {
    console.log('useeffect run')
    const fetchData = async() => {
      // owner of の呼出し
      // 配列にする
      const nftNum = await nftContract.getNftNum()
      for (let step = 0; step < nftNum; step++) {
        tokenIdList.push(step)
      }
      console.log('nftNum')
      console.log(tokenIdList)
      console.log('nftNum')
      const info = await Promise.all(
          tokenIdList.map(async(id) => {
            const owner = await nftContract.ownerOf(id)
            const tokenId = id
            const metaDataUri = await nftContract.tokenURI(id)
            const metaData =  (await axios.get(metaDataUri)).data
            const address = await getAccount()
            console.log('address')
            console.log(address)
            console.log('address')
            const result = { id:tokenId, owner:owner, tokenId:tokenId, imageUri: metaData.image }
            if(owner.toUpperCase() === address.toUpperCase()) {
              return result
            }
          })
      )
      return info.filter(v => v)
      // setNftSalePageInfo((prevState) => ([ ...prevState, info ]));
    };
    fetchData().then(
        (info) => {
          setNftSalePageInfo(info)
    }).catch((e) => console.log(e));
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <MarginTop />
        { isLoading ?
              <Loading /> :
              <ImgList
              data={nftSalePageInfo}
              title="所持しているNFT"
            />
        }


        <MarginTop />
        <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Mint
          </Typography>
        <input
          name="file"
          type="file"
          accept="image/*"
          onChange={onChangeFile}
        />
        <Button variant="contained" disabled={!file} onClick={onClickSubmit}>Mint</Button>
      </Container>
    </React.Fragment>
  );
}
