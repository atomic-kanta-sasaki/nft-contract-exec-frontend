import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ImgList from './ImgList'
import { ethers, Contract } from "ethers";
import { useEffect, useState } from "react";
import artifact from "../abi/nft.json";
import axios, { AxiosError } from 'axios'
import style from "styled-components";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const FormData = require("form-data");
const MarginTop = style.div`
  margin-top 5%
`;


export default function SimpleContainer() {
  const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiOTkwMTFiNC1lNzIyLTQ1NGMtOWEwNC0yOWE3OWU2ZjZjMzIiLCJlbWFpbCI6ImthLXNhc2FraUBzaW9zLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxYzA3ZGE4ZDA5OGJmY2VlNWFmMyIsInNjb3BlZEtleVNlY3JldCI6ImU0MmZiYTE3OWQxNWZiZGFiMTQ3ZmUxOWJmMGVkMGI5N2QzN2FmNWJlNjE1NWVjZGYzM2Q2MjRkNjgyN2IwM2YiLCJpYXQiOjE2NjkwMjQwMjN9.8eC7ByPhkihGcR29rZeplrpaVDaZ_Nlpuae9nVAmkFY"

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
  const tokenIdList = [1,2,3,4,5, 6 ,7]
  const info = []
  const getAccount = async () => {
    try {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
    nftContract.safeMint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", res1.data.IpfsHash)

  }

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

        const address = await getAccount()
        console.log(owner.toUpperCase() === address.toUpperCase())
        console.log(owner)
        console.log(address)
        if(owner.toUpperCase() === address.toUpperCase()) {
          info.push({id:tokenId, owner:owner, tokenId:tokenId, imageUri: metaData.image})
        }
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
          title="所持しているNFT"
        />
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