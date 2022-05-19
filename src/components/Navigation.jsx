import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationMenu, useAppBridge, useClientRouting, useRoutePropagation } from "@shopify/app-bridge-react";

export const Navigation = () => {
    const app = useAppBridge();
    // Use location
    const location = useLocation();
    const navigate = useNavigate();
    useRoutePropagation(location);
    useClientRouting({
        replace(path) {
            navigate(path);
        }
    });
    useEffect(() => {

    }, [])

    const dashBoardLink = { label: 'Dashboard', destination: '/' };
    const productsLink = { label: 'Products', destination: '/products' };
    const createProductLink = { label: 'Create', destination: '/create' };
    return (
        <NavigationMenu
            navigationLinks={[dashBoardLink, productsLink, createProductLink]}
        />
    )
}