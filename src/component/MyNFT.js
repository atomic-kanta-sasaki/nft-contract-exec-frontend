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
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const FormData = require("form-data");
const MarginTop = style.div`
  margin-top 5%
`;
export default function SimpleContainer() {
  const jwtToken = process.env.REACT_APP_PINATA_JWT_KEY
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.REACT_APP_ALCHEMY_API_KEY
  );
  const userWallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
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
  const onChangeFile = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const onClickSubmit = async () => {
    try {
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
      setMessage("Mintに成功しました。")
      setOpen(true);
    } catch(e) {
      setIsLoading(false);
      setMessage("Mintに失敗しました。")
      setOpen(true);

    }
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
    };
    fetchData().then(
        (info) => {
          setNftSalePageInfo(info)
    }).catch((e) => console.log(e));
  }, []);

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
      <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            message={message}
            action={action}
          />
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
