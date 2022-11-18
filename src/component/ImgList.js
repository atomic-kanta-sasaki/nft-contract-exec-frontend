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
 const contractAddress = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
 // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
 // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
 const provider = new ethers.providers.JsonRpcProvider();
 const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
 const signer = provider.getSigner();
 const nftContract = contract.connect(signer);

 const signer0 = provider.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
 const nftContract0 = contract.connect(signer0);
// イベントハンドラ
// safeTranferを実行する
// 購入者がデポジットする
// transfer購入者 -> 出品者
// withdraw出品者
const handleClick = async(e) => {
  const kk = await nftContract.approve(e.to, e.tokenId)
  await nftContract['safeTransferFrom(address,address,uint256)'](e.from, e.to, e.tokenId)

  // ether送金
  let receiverAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  // 送付する Ether の量
  let amountInEther = '10'

  // トランザクションオブジェクトを作成
  let tx = {
      to: receiverAddress,
      // 単位 ether を、単位 wei に変換
      value: ethers.utils.parseEther(amountInEther)
  }
  const signer02 = provider.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  signer02.sendTransaction(tx)
    .then((txObj) => {
        console.log(txObj)
    })
}

const handleClick0 = async(e) => {
  const kk = await nftContract0.approve(e.to, e.tokenId)
  await nftContract['safeTransferFrom(address,address,uint256)'](e.from, e.to, e.tokenId)

  // ether送金
  let receiverAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  // 送付する Ether の量
  let amountInEther = '10'

  // トランザクションオブジェクトを作成
  let tx = {
      to: receiverAddress,
      // 単位 ether を、単位 wei に変換
      value: ethers.utils.parseEther(amountInEther)
  }
  const signer03 = provider.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  signer03.sendTransaction(tx)
  .then((txObj) => {
      console.log(txObj)
  })
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
                          <Button variant="contained" onClick={() => handleClick({from:"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", to:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8', tokenId:item.tokenId})}>購入</Button>
                          <Button variant="contained" onClick={() => handleClick0({from:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8', to:"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", tokenId:item.tokenId})}>再購入</Button>
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

export default StandardImageList;
