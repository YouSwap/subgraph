subgraph.yaml中可以根据情况更改 ido的合约地址。
如event事件不变，则不需其他开发工作。


编译：
    ``yarn
    ``
    ``yarn codegen
    ``
    ``yarn build``

部署：
    ``graph create v1-subgraph-ido --node   http://54.254.0.89:8020 --ipfs http://54.254.0.89:5001
    ``
    ``graph deploy v1-subgraph-ido --node   http://54.254.0.89:8020 --ipfs http://54.254.0.89:5001
    ``

    
