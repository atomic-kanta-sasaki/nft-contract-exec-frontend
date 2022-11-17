import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import style from 'styled-components';
import Button from '@mui/material/Button';
import artifact from "../abi/nft.json";
import { ethers, Contract } from "ethers";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const DisplayFlex = style.div`
  display: flex;
`;

const MarginTop = style.div`
  margin-top:60%
`
 // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
 const contractAddress = "0x04c89607413713ec9775e14b954286519d836fef";
 // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
 // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
 const provider = new ethers.providers.JsonRpcProvider();
 const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
 const signer = provider.getSigner();
 const nftContract = contract.connect(signer);
// イベントハンドラ
// safeTranferを実行する
// 購入者がデポジットする
// transfer購入者 -> 出品者
// withdraw出品者
const handleClick = async(e) => {
  console.log(nftContract)
  const kk = await nftContract['safeTransferFrom(address,address,uint256)'](e.from, e.to, e.tokenId)
  console.log(kk)
}
const StandardImageList = (props) => {
  console.log("props")
  console.log(props.length)
  console.log("props")
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {props[0]?.map((item) => (
            <Grid item xs={2} sm={4} md={4}>
              <Item>
                <ImageList sx={{ width: 400, height: 400 }} cols={1} rowHeight={164} key={item.id}>
                  <ImageListItem key={item.id}>
                      <div>
                        <img
                          src={`${item.imageUri}?w=164&h=164&fit=crop&auto=format`}
                          srcSet={`${item.imageUri}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                          alt={item.title}
                          style={{height: '200px', width: '200px'}}
                          loading="lazy"
                        />
                      </div>
                      <div>
                        所有者:<br /> {item.owner} <br />

                        値段: 1ETH <br />
                          <Button variant="contained" onClick={() => handleClick({from:item.owner, to:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8', tokenId:item.tokenId})}>Contained</Button>
                      </div>
                  </ImageListItem>
                </ImageList>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
    owner: 'owner 01',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
    owner: 'owner 01',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    owner: 'owner 01',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
    owner: 'owner 01',

  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
    owner: 'owner 01',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
    owner: 'owner 01',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
    owner: 'owner 02',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
    owner: 'owner 02',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
    owner: 'owner 02',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
    owner: 'owner 02',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
    owner: 'owner 02',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
    owner: 'owner 02',
  },
];

export default StandardImageList;
