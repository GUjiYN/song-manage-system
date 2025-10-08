import { NextResponse } from 'next/server';

// 假设你有一些商品数据
const products = [
    { id: 1, name: '苹果', price: 5.99 },
    { id: 2, name: '香蕉', price: 3.50 },
    { id: 3, name: '橙子', price: 4.00 },
];

export async function POST() {
    // 在这里你可以写一些业务逻辑，比如从数据库查询数据

    // 返回一个JSON响应
    return NextResponse.json(products);
}

export async function GET() {
    return NextResponse.json({ message: "This is a GET request" });
}