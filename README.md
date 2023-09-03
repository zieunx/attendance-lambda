# attendance-app

## local에서 테스트 하기

### sam-cli

```
sam local invoke
```

코드 수정 후 다시 테스트 하려면 빌드해줘야 한다.

```
sam build
```

## 참고사항

### sam-cli local test 시 주의 사항

[관련이슈](https://github.com/aws/aws-sam-cli/issues/4329)

> DOCKER_HOST=unix://$HOME/.docker/run/docker.sock sam local invoke
